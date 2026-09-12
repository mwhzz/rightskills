import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const orderStatusLabel: Record<string, string> = {
  pending: "Waiting for TrxID",
  awaiting_review: "Needs review",
  paid: "Paid",
  rejected: "Rejected",
};

export async function OrderStatusBadge({
  status,
  audience = "admin",
}: {
  status: string;
  audience?: "admin" | "student";
}) {
  let labels = orderStatusLabel;
  if (audience === "student") {
    const dict = await getDictionary();
    labels = {
      pending: dict.orderStatus.pending,
      awaiting_review: dict.orderStatus.awaitingReview,
      paid: dict.orderStatus.paid,
      rejected: dict.orderStatus.rejected,
    };
  }
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "paid" && "bg-primary/10 text-primary",
        status === "awaiting_review" && "bg-amber-100 text-amber-900",
        status === "pending" && "bg-muted text-muted-foreground",
        status === "rejected" && "bg-destructive/10 text-destructive"
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}

export async function StudentOrderTimeline({ status }: { status: string }) {
  const dict = await getDictionary();
  const studentTimeline = [
    { id: "placed", label: dict.orderTimeline.placed },
    { id: "trx", label: dict.orderTimeline.trxSent },
    { id: "unlock", label: dict.orderTimeline.unlocked },
  ] as const;
  const trxDone = status === "awaiting_review" || status === "paid";
  const unlocked = status === "paid";
  const rejected = status === "rejected";
  const states: { done: boolean; current: boolean; failed?: boolean }[] = [
    { done: true, current: status === "pending" && !rejected },
    {
      done: trxDone,
      current: status === "awaiting_review",
      failed: rejected,
    },
    { done: unlocked, current: false },
  ];

  return (
    <ol className="grid gap-2 sm:grid-cols-3">
      {studentTimeline.map((step, index) => {
        const state = states[index];
        return (
          <li key={step.id} className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                state.done && "bg-primary text-primary-foreground",
                state.current && !state.done && "bg-amber-100 text-amber-900",
                state.failed && "bg-destructive/10 text-destructive",
                !state.done && !state.current && !state.failed && "bg-muted text-muted-foreground"
              )}
            >
              {index + 1}
            </span>
            <span
              className={cn(
                state.done || state.current ? "text-foreground" : "text-muted-foreground",
                state.failed && "text-destructive"
              )}
            >
              {state.failed ? dict.orderTimeline.rejected : step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
