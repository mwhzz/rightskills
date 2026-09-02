import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession, safeNextPath } from "@/lib/auth";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const user = await getSession();
  if (user) redirect(safeNextPath(next, user.role));
  const checkout = next?.startsWith("/checkout");

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Create account
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {checkout
          ? "Your cart is saved. Create an account to place the order."
          : "Students sign up with a mobile number and a 4-digit PIN. Teachers are added by an admin."}
      </p>
      <AuthForm mode="register" error={error} next={next} />
    </div>
  );
}
