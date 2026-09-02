import { cn } from "@/lib/utils";

export const orderStatusLabel: Record<string, string> = {
  pending: "Waiting for TrxID",
  awaiting_review: "Needs review",
  paid: "Paid",
  rejected: "Rejected",
};

export const studentOrderStatusLabel: Record<string, string> = {
  pending: "Waiting for TrxID",
  awaiting_review: "Waiting for admin",
  paid: "Paid — course unlocked",
  rejected: "Rejected",
};

export function OrderStatusBadge({
  status,
  audience = "admin",
}: {
  status: string;
  audience?: "admin" | "student";
}) {
  const labels = audience === "student" ? studentOrderStatusLabel : orderStatusLabel;
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

const studentTimeline = [
  { id: "placed", label: "Order placed" },
  { id: "trx", label: "TrxID sent" },
  { id: "unlock", label: "Course unlocked" },
] as const;

export function StudentOrderTimeline({ status }: { status: string }) {
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
              {state.failed ? "Payment rejected" : step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
