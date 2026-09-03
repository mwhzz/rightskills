const steps = [
  { n: 1, label: "Place order" },
  { n: 2, label: "Send money" },
  { n: 3, label: "Unlock" },
] as const;

export function PaymentPills() {
  return (
    <ol className="flex items-stretch gap-0 sm:grid sm:grid-cols-3 sm:gap-2">
      {steps.map((step, index) => (
        <li
          key={step.n}
          className="flex min-w-0 flex-1 items-center gap-1.5 sm:rounded-full sm:border sm:border-border/80 sm:bg-background/75 sm:px-3 sm:py-2 sm:backdrop-blur-sm"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
            {step.n}
          </span>
          <span className="min-w-0 truncate text-[11px] font-medium sm:text-sm">
            {step.label}
          </span>
          {index < steps.length - 1 ? (
            <span
              aria-hidden
              className="mx-1 h-px flex-1 bg-border sm:hidden"
            />
          ) : null}
        </li>
      ))}
    </ol>
  );
}
