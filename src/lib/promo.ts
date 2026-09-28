import { prisma } from "@/lib/db";
import { makeOrderId, type PaymentMethod } from "@/lib/store";

export type PromoPreview =
  | { ok: true; code: string; discountBdt: number; totalBdt: number }
  | { ok: false; reason: "invalid" | "used" };

export class PromoError extends Error {
  reason: "invalid" | "used";

  constructor(reason: "invalid" | "used") {
    super(reason);
    this.reason = reason;
  }
}

export function normalizePromoCode(raw: string) {
  const code = raw.trim().toUpperCase().replace(/\s+/g, "");
  if (!/^[A-Z0-9-]{3,20}$/.test(code)) return null;
  return code;
}

export function discountFor(kind: string, value: number, subtotal: number) {
  if (subtotal <= 0 || value <= 0) return 0;
  if (kind === "percent") {
    const percent = Math.min(100, value);
    return Math.min(subtotal, Math.round((subtotal * percent) / 100));
  }
  return Math.min(subtotal, value);
}

type PromoRow = {
  id: string;
  code: string;
  kind: string;
  value: number;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
};

function rejectReason(promo: PromoRow | null): "invalid" | "used" | null {
  if (!promo || !promo.active) return "invalid";
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) return "used";
  return null;
}

export async function quotePromo(raw: string, subtotal: number): Promise<PromoPreview> {
  const code = normalizePromoCode(raw);
  if (!code) return { ok: false, reason: "invalid" };
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  const reason = rejectReason(promo);
  if (reason || !promo) return { ok: false, reason: reason ?? "invalid" };
  const discountBdt = discountFor(promo.kind, promo.value, subtotal);
  return {
    ok: true,
    code: promo.code,
    discountBdt,
    totalBdt: Math.max(0, subtotal - discountBdt),
  };
}

export async function placeOrderWithPromo(input: {
  userId: string;
  method: PaymentMethod;
  payerNumber: string;
  subtotal: number;
  promoRaw: string;
  items: { courseId: string; priceBdt: number }[];
}) {
  const raw = input.promoRaw.trim();
  return prisma.$transaction(async (tx) => {
    let promoCode = "";
    let discountBdt = 0;

    if (raw) {
      const code = normalizePromoCode(raw);
      if (!code) throw new PromoError("invalid");
      const promo = await tx.promoCode.findUnique({ where: { code } });
      const reason = rejectReason(promo);
      if (reason || !promo) throw new PromoError(reason ?? "invalid");
      const claimed = await tx.promoCode.updateMany({
        where: {
          id: promo.id,
          active: true,
          ...(promo.maxUses != null ? { usedCount: { lt: promo.maxUses } } : {}),
        },
        data: { usedCount: { increment: 1 } },
      });
      if (claimed.count !== 1) throw new PromoError("used");
      discountBdt = discountFor(promo.kind, promo.value, input.subtotal);
      promoCode = promo.code;
    }

    return tx.order.create({
      data: {
        orderId: makeOrderId(),
        userId: input.userId,
        totalBdt: Math.max(0, input.subtotal - discountBdt),
        discountBdt,
        promoCode,
        method: input.method,
        payerNumber: input.payerNumber,
        status: "awaiting_review",
        items: { create: input.items },
      },
    });
  });
}
