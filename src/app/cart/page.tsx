import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";

export const metadata: Metadata = {
  title: "Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-36 sm:px-6 sm:py-10 lg:pb-10">
      <h1 className="mb-5 font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
        Cart
      </h1>
      <CartView />
    </div>
  );
}
