import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.nav.studio };
}

export default async function BrandsPage() {
  const dict = await getDictionary();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
      <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        {dict.nav.studio}
      </h1>
    </div>
  );
}
