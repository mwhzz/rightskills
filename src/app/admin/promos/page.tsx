import Link from "next/link";
import {
  createPromoAction,
  deletePromoAction,
  setPromoActiveAction,
  updatePromoAction,
} from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { formatBdt } from "@/lib/format";
import { requireAccess } from "@/lib/staff";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  code: "Use 3–20 letters or numbers. Example: EID50.",
  value: "Percent is 1–100. A fixed discount is a whole amount in taka.",
  uses: "Use limit has to be a whole number, or leave it blank.",
  taken: "That code already exists.",
};

export default async function AdminPromosPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAccess("orders");
  const { saved, error } = await searchParams;
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-sm text-muted-foreground">
        <Link href="/admin" className="hover:text-foreground">
          Dashboard
        </Link>
        <span className="mx-2">/</span>
        Promos
      </p>
      <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight">Promo codes</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        Students enter a code at checkout. The amount they send on bKash or Nagad drops
        by the discount. A use is counted when the order is placed.
      </p>

      {saved === "1" ? (
        <p className="mt-5 rounded-2xl bg-[#fff1e6] px-4 py-3 text-sm">Code saved.</p>
      ) : null}
      {error && errors[error] ? (
        <p className="mt-5 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errors[error]}
        </p>
      ) : null}

      <form
        action={createPromoAction}
        className="mt-6 rounded-[1.5rem] bg-card p-5 shadow-[0_18px_40px_-28px_rgba(80,40,10,0.35)] ring-1 ring-black/5 sm:p-6"
      >
        <p className="font-heading text-lg font-semibold">New code</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Code</span>
            <input
              name="code"
              required
              maxLength={20}
              placeholder="EID50"
              className="mt-1.5 h-11 w-full rounded-xl border bg-[#fffaf6] px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground">Discount</span>
            <span className="mt-1.5 flex h-11 overflow-hidden rounded-xl border bg-[#fffaf6] focus-within:ring-2 focus-within:ring-primary/30">
              <select
                name="kind"
                defaultValue="percent"
                className="bg-transparent px-3 text-sm outline-none"
              >
                <option value="percent">Percent</option>
                <option value="amount">Taka off</option>
              </select>
              <input
                name="value"
                type="number"
                min={1}
                required
                placeholder="10"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              />
            </span>
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">
              Use limit <span className="font-normal">(blank means no limit)</span>
            </span>
            <input
              name="maxUses"
              type="number"
              min={1}
              placeholder="Unlimited"
              className="mt-1.5 h-11 w-full rounded-xl border bg-[#fffaf6] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>
        <button type="submit" className={cn(buttonVariants(), "mt-4 h-11 rounded-xl px-5")}>
          Save code
        </button>
      </form>

      <ul className="mt-6 space-y-3">
        {promos.length === 0 ? (
          <li className="rounded-[1.5rem] bg-card px-5 py-8 text-sm text-muted-foreground ring-1 ring-black/5">
            No codes yet.
          </li>
        ) : (
          promos.map((promo) => (
            <li
              key={promo.id}
              className="rounded-[1.5rem] bg-card px-5 py-4 ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-heading text-lg font-semibold tracking-wide">{promo.code}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {promo.kind === "percent" ? `${promo.value}% off` : `${formatBdt(promo.value)} off`}
                  {" · "}
                  {promo.usedCount} used
                  {promo.maxUses != null ? ` / ${promo.maxUses}` : ""}
                  {" · "}
                  {promo.active ? "On" : "Off"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={setPromoActiveAction}>
                  <input type="hidden" name="id" value={promo.id} />
                  <input type="hidden" name="active" value={promo.active ? "0" : "1"} />
                  <button
                    type="submit"
                    className="rounded-full bg-[#fff4eb] px-3 py-1.5 text-xs font-semibold"
                  >
                    {promo.active ? "Turn off" : "Turn on"}
                  </button>
                </form>
                <form action={deletePromoAction}>
                  <input type="hidden" name="id" value={promo.id} />
                  <button type="submit" className="px-2 py-1.5 text-xs font-medium text-destructive">
                    Delete
                  </button>
                </form>
              </div>
              </div>
              <form action={updatePromoAction} className="mt-4 grid gap-3 border-t border-black/5 pt-4 sm:grid-cols-2">
                <input type="hidden" name="id" value={promo.id} />
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">Code</span>
                  <input
                    name="code"
                    required
                    maxLength={20}
                    defaultValue={promo.code}
                    className="mt-1.5 h-11 w-full rounded-xl border bg-[#fffaf6] px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">Discount</span>
                  <span className="mt-1.5 flex h-11 overflow-hidden rounded-xl border bg-[#fffaf6] focus-within:ring-2 focus-within:ring-primary/30">
                    <select
                      name="kind"
                      defaultValue={promo.kind}
                      className="bg-transparent px-3 text-sm outline-none"
                    >
                      <option value="percent">Percent</option>
                      <option value="amount">Taka off</option>
                    </select>
                    <input
                      name="value"
                      type="number"
                      min={1}
                      required
                      defaultValue={promo.value}
                      className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-muted-foreground">
                    Use limit <span className="font-normal">(blank means no limit)</span>
                  </span>
                  <input
                    name="maxUses"
                    type="number"
                    min={1}
                    defaultValue={promo.maxUses ?? ""}
                    placeholder="Unlimited"
                    className="mt-1.5 h-11 w-full rounded-xl border bg-[#fffaf6] px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </label>
                <label className="flex items-end gap-2 pb-3 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="active"
                    value="1"
                    defaultChecked={promo.active}
                    className="size-4 accent-primary"
                  />
                  On
                </label>
                <div className="sm:col-span-2">
                  <button type="submit" className={cn(buttonVariants(), "h-10 rounded-xl px-4")}>
                    Save changes
                  </button>
                </div>
              </form>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
