import { submitTrxAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TrxForm({
  orderId,
  defaultTrxId,
  defaultPayerNumber,
  from,
}: {
  orderId: string;
  defaultTrxId?: string | null;
  defaultPayerNumber?: string | null;
  from?: "success";
}) {
  return (
    <form action={submitTrxAction} className="space-y-2">
      <input type="hidden" name="orderId" value={orderId} />
      {from ? <input type="hidden" name="from" value={from} /> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          name="trxId"
          defaultValue={defaultTrxId ?? ""}
          placeholder="Paste TrxID from bKash or Nagad"
          className="h-11 flex-1 font-mono text-sm"
          autoComplete="off"
        />
        <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-11")}>
          {defaultTrxId ? "Update TrxID" : "Submit TrxID"}
        </button>
      </div>
      <Input
        name="payerNumber"
        type="tel"
        inputMode="numeric"
        defaultValue={defaultPayerNumber ?? ""}
        placeholder="Number you paid from (01XXXXXXXXX)"
        className="h-11 text-sm"
        autoComplete="tel"
      />
    </form>
  );
}
