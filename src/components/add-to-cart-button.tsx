import {
  addToCartAction,
  buyNowAction,
} from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  slug,
  owned,
  inCart,
}: {
  slug: string;
  owned: boolean;
  inCart: boolean;
}) {
  if (owned) {
    return (
      <Link
        href={`/learn/${slug}`}
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full text-base")}
      >
        <Check data-icon="inline-start" />
        Go to course
      </Link>
    );
  }

  if (inCart) {
    return (
      <Link
        href="/cart"
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "h-12 w-full text-base"
        )}
      >
        <ShoppingBag data-icon="inline-start" />
        In cart — checkout
      </Link>
    );
  }

  return (
    <form action={addToCartAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full text-base")}
      >
        <ShoppingBag data-icon="inline-start" />
        Add to cart
      </button>
    </form>
  );
}

export function BuyNowButton({
  slug,
  owned,
}: {
  slug: string;
  owned: boolean;
}) {
  if (owned) return null;

  return (
    <form action={buyNowAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "h-12 w-full text-base"
        )}
      >
        Buy now
      </button>
    </form>
  );
}
