const steps = [
  { n: 1, label: "Place order" },
  { n: 2, label: "Send money" },
  { n: 3, label: "Unlock" },
] as const;

export function PaymentPills() {
  return (
    <ol className="grid grid-cols-3 gap-2">
      {steps.map((step) => (
        <li
          key={step.n}
          className="flex items-center gap-2 rounded-full border border-border/80 bg-background/75 px-2.5 py-2 backdrop-blur-sm sm:px-3"
        >
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/12 text-[11px] font-semibold text-primary">
            {step.n}
          </span>
          <span className="truncate text-xs font-medium sm:text-sm">
            {step.label}
          </span>
        </li>
      ))}
    </ol>
  );
}
