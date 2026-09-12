import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export async function PaymentSteps({ current }: { current: 1 | 2 | 3 }) {
  const dict = await getDictionary();
  const steps = [1, 2, 3].map((n) => ({
    n,
    label: dict.paymentSteps.labels[n - 1],
  }));

  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((step) => {
        const done = step.n < current;
        const active = step.n === current;
        return (
          <li
            key={step.n}
            className={cn(
              "rounded-2xl border px-4 py-3",
              active && "border-primary/40 bg-primary/5",
              done && "bg-card"
            )}
          >
            <p
              className={cn(
                "text-xs font-medium tracking-[0.14em] uppercase",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {dict.paymentSteps.stepLabel(step.n)}
            </p>
            <p className="mt-1 text-sm font-medium">{step.label}</p>
          </li>
        );
      })}
    </ol>
  );
}
