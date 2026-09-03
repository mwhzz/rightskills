import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession, safeNextPath } from "@/lib/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const user = await getSession();
  if (user) redirect(safeNextPath(next, user.role));
  const checkout = next?.startsWith("/checkout");

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
        Log in
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {checkout
          ? "Your cart is saved. Log in to place the order, then send money."
          : "Use your mobile number and 4-digit PIN. Staff land in Admin."}
      </p>
      <AuthForm mode="login" error={error} next={next} />
    </div>
  );
}
