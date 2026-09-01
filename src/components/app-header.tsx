import { getCart } from "@/lib/session";
import { SiteHeader } from "@/components/site-header";

export async function AppHeader() {
  const cart = await getCart();
  return <SiteHeader cartCount={cart.length} />;
}
