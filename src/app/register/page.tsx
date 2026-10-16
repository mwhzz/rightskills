import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { getSession, safeNextPath } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { pageMetadata } from "@/lib/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("register");
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;
  const user = await getSession();
  if (user) redirect(safeNextPath(next, user.role));
  const checkout = next?.startsWith("/checkout");
  const dict = await getDictionary();

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        {dict.registerPage.title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {checkout ? dict.registerPage.checkoutSubtitle : dict.registerPage.subtitle}
      </p>
      <AuthForm mode="register" error={error} next={next} />
    </div>
  );
}
