import { AppHeader } from "@/components/app-header";
import { MobileDock } from "@/components/mobile-dock";
import { SiteFooter } from "@/components/site-footer";
import { getSession } from "@/lib/auth";
import { getHomepageLearning } from "@/lib/queries";

export async function AppChrome({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  const learning = user
    ? await getHomepageLearning(user.id).catch(() => null)
    : null;
  const continueItem = learning?.continueItem;

  return (
    <>
      <AppHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter
        user={user ? { name: user.name, role: user.role } : null}
      />
      <MobileDock
        href={continueItem?.href ?? (user ? "/account" : "/courses")}
        label={continueItem ? "Continue" : user ? "My panel" : "Browse courses"}
      />
    </>
  );
}
