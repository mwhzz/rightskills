import { getCart } from "@/lib/session";
import { getSession } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";

export async function AppHeader() {
  const [cart, user] = await Promise.all([getCart(), getSession()]);
  return (
    <SiteHeader
      cartCount={cart.length}
      user={user ? { name: user.name, role: user.role } : null}
    />
  );
}
