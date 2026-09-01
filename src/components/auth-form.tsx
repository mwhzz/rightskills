import Link from "next/link";
import { loginAction, registerAction } from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const errors: Record<string, string> = {
  name: "Enter your full name.",
  phone: "Enter an 11-digit Bangladeshi mobile number (01XXXXXXXXX).",
  password: "Password must be at least 6 characters.",
  taken: "That mobile number already has an account. Log in instead.",
  invalid: "Mobile number or password is wrong.",
};

export function AuthForm({
  mode,
  error,
  next,
}: {
  mode: "login" | "register";
  error?: string;
  next?: string;
}) {
  const action = mode === "login" ? loginAction : registerAction;
  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="next" value={next || "/learn"} />
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
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      {error && errors[error] ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {errors[error]}
        </p>
      ) : null}
      <button type="submit" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
        {mode === "login" ? "Log in" : "Create account"}
      </button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="font-medium text-foreground hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-foreground hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
