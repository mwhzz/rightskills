import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Cart",
};

export default async function CartPage() {
  const dict = await getDictionary();
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-heading text-3xl font-semibold tracking-tight">
        {dict.nav.cart}
      </h1>
      <CartView />
    </div>
  );
}
