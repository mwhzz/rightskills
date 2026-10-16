import { StudentShell } from "@/components/student-shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser("/account");
  return <StudentShell user={user}>{children}</StudentShell>;
}
