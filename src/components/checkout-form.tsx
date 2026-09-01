import { checkoutAction } from "@/app/actions";
import { formatBdt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const methods = [
  { id: "bkash", name: "bKash", hint: "Send Money to our bKash personal/merchant number" },
  { id: "nagad", name: "Nagad", hint: "Send Money to our Nagad number" },
] as const;

const errorCopy: Record<string, string> = {
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
      <div className="space-y-3 rounded-xl border bg-card p-5">
        <h2 className="font-heading text-base font-semibold">Pay with</h2>
        <p className="text-sm text-muted-foreground">
          After you place the order you will see the number, amount, and order
          ID. Send Money, then paste the TrxID from My orders.
        </p>
        <div className="grid gap-2">
          {methods.map((item, index) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-colors hover:bg-muted/60"
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
      </div>

      {error && errorCopy[error] ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errorCopy[error]}
        </p>
      ) : null}

      <button type="submit" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
        Place order · {formatBdt(totalBdt)}
      </button>
    </form>
  );
}
