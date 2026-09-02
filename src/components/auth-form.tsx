import Link from "next/link";
import { loginAction, registerAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const errors: Record<string, string> = {
  name: "Enter your full name.",
  phone: "Enter an 11-digit Bangladeshi mobile number (01XXXXXXXXX).",
  pin: "Enter a 4-digit PIN.",
  taken: "That mobile number already has an account. Log in instead.",
  invalid: "Mobile number or PIN is wrong.",
};

export function AuthForm({
  mode,
  error,
  next,
  embedded = false,
}: {
  mode: "login" | "register";
  error?: string;
  next?: string;
  embedded?: boolean;
}) {
  const action = mode === "login" ? loginAction : registerAction;
  const nextValue = next || "";
  const nextQuery = nextValue
    ? `?next=${encodeURIComponent(nextValue)}`
    : "";

  return (
    <form action={action} className={cn(embedded ? "mt-4 space-y-4" : "mt-8 space-y-4")}>
      <input type="hidden" name="next" value={nextValue} />
      {mode === "register" ? (
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={3}
            className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      ) : null}
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
          inputMode="numeric"
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="pin" className="text-sm font-medium">
          4-digit PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          required
          minLength={4}
          maxLength={4}
          pattern="[0-9]{4}"
          placeholder="••••"
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-center font-heading text-lg tracking-[0.5em] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      {error && errors[error] ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errors[error]}
        </p>
      ) : null}
      <button type="submit" className={cn(buttonVariants({ size: "lg" }), "h-10 w-full")}>
        {mode === "login"
          ? embedded
            ? "Log in and continue"
            : "Log in"
          : embedded
            ? "Create account and continue"
            : "Create account"}
      </button>
      {embedded ? null : (
        <p className="text-center text-sm text-muted-foreground">
          {mode === "login" ? (
            <>
              New here?{" "}
              <Link
                href={`/register${nextQuery}`}
                className="font-medium text-foreground hover:underline"
              >
                Create an account
              </Link>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <Link
                href={`/login${nextQuery}`}
                className="font-medium text-foreground hover:underline"
              >
                Log in
              </Link>
            </>
          )}
        </p>
      )}
    </form>
  );
}
