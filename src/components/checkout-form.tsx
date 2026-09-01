import { checkoutAction } from "@/app/actions";
import { formatBdt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const methods = [
  { id: "bkash", name: "bKash", hint: "Pay with your bKash wallet" },
  { id: "nagad", name: "Nagad", hint: "Pay with Nagad" },
  { id: "card", name: "Card", hint: "Visa, Mastercard, or debit" },
] as const;

const errorCopy: Record<string, string> = {
  name: "Enter your full name.",
  phone: "Enter an 11-digit Bangladeshi mobile number.",
  email: "Enter a valid email so we can send your receipt.",
  method: "Choose a payment method.",
};

export function CheckoutForm({
  totalBdt,
  error,
}: {
  totalBdt: number;
  error?: string;
}) {
  return (
    <form action={checkoutAction} className="space-y-6">
      <div className="space-y-4 rounded-xl border bg-card p-5">
        <div>
          <h2 className="font-heading text-base font-semibold">Your details</h2>
          <p className="text-sm text-muted-foreground">
            We use this to issue your course access. This demo stores the order
            in a cookie on your browser.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <input
              id="name"
              name="name"
              required
              minLength={3}
              placeholder="e.g. Sadia Rahman"
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              autoComplete="name"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="phone" className="text-sm font-medium">
              Mobile
            </label>
            <input
              id="phone"
              name="phone"
              required
              pattern="01[3-9][0-9]{8}"
              placeholder="017XXXXXXXX"
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              inputMode="numeric"
              autoComplete="tel"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              autoComplete="email"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-base font-semibold">Pay with</h2>
        <div className="grid gap-2">
          {methods.map((item, index) => (
            <label
              key={item.id}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-colors hover:bg-muted/60"
              )}
            >
              <input
                type="radio"
                name="method"
                value={item.id}
                defaultChecked={index === 0}
                className="accent-primary"
              />
              <span>
                <span className="block font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Demo only — no wallet or card is charged. Access unlocks immediately
          after you confirm.
        </p>
      </div>

      {error && errorCopy[error] ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorCopy[error]}
        </p>
      ) : null}

      <button type="submit" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
        Pay {formatBdt(totalBdt)}
      </button>
    </form>
  );
}
