import { AuthForm } from "@/components/auth-form";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Create account
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Students sign up with a mobile number. Teachers are added by an admin.
      </p>
      <AuthForm mode="register" error={error} next={next} />
    </div>
  );
}
