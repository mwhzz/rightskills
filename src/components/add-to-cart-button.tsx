import {
  addToCartAction,
  buyNowAction,
} from "@/app/actions";
import { buttonVariants } from "@/components/ui/button";
import { Check, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export async function AddToCartButton({
  slug,
  owned,
  inCart,
}: {
  slug: string;
  owned: boolean;
  inCart: boolean;
}) {
  const dict = await getDictionary();

  if (owned) {
    return (
      <Link
        href={`/learn/${slug}`}
        className={cn(buttonVariants({ size: "lg" }), "h-12 w-full text-base")}
      >
        <Check data-icon="inline-start" />
        {dict.cta.goToCourse}
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
        {dict.cta.inCartCheckout}
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
        {dict.cta.addToCart}
      </button>
    </form>
  );
}

/**
 * Buy now for a course card. The card is one big stretched link, so this sits
 * above it on its own layer and stops the click from opening the card.
 */
export async function CardBuyNowButton({ slug }: { slug: string }) {
  const dict = await getDictionary();
  return (
    <form action={buyNowAction} className="relative z-10">
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className={cn(buttonVariants({ size: "sm" }), "h-10 w-full text-sm")}
      >
        <ShoppingBag data-icon="inline-start" />
        {dict.cta.buyNow}
      </button>
    </form>
  );
}

export async function BuyNowButton({
  slug,
  owned,
}: {
  slug: string;
  owned: boolean;
}) {
  if (owned) return null;
  const dict = await getDictionary();

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
        {dict.cta.buyNow}
      </button>
    </form>
  );
}
