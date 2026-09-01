import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Log in
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use your Bangladeshi mobile number and password.
      </p>
      <AuthForm mode="login" error={error} next={next} />
    </div>
  );
}
