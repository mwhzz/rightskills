import { AdminShell, type AdminNavLink } from "@/components/admin/admin-shell";
import { can, getStaffSession, type StaffKey } from "@/lib/staff";

export const dynamic = "force-dynamic";

const links: (AdminNavLink & { access: StaffKey })[] = [
  { href: "/admin", label: "Dashboard", access: "courses" },
  { href: "/admin/courses", label: "Courses", access: "courses", group: "Teaching" },
  { href: "/admin/just-added", label: "Just added", access: "courses", group: "Teaching" },
  { href: "/admin/students", label: "Students", access: "students", group: "Teaching" },
  { href: "/admin/reviews", label: "Reviews", access: "reviews", group: "Teaching" },
  { href: "/admin/orders", label: "Orders", access: "orders", group: "Sales" },
  { href: "/admin/promos", label: "Promos", access: "orders", group: "Sales" },
  { href: "/admin/users", label: "Users", access: "users", group: "Site" },
  { href: "/admin/activity", label: "Activity log", access: "orders", group: "Site" },
  { href: "/admin/banners", label: "Banners", access: "banners", group: "Site" },
  { href: "/admin/offers", label: "Offers", access: "offers", group: "Site" },
  { href: "/admin/settings", label: "Settings", access: "settings", group: "Site" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await getStaffSession();

  const visible = links.filter((link) => {
    if (link.href === "/admin") return true;
    if (staff.isTeacher && link.href === "/admin/just-added") return false;
    if (staff.isTeacher && (link.access === "courses" || link.access === "reviews")) {
      return true;
    }
    if (staff.isTeacher && link.access === "students") return true;
    if (link.href === "/admin/activity") return !staff.isTeacher;
    return can(staff.access, link.access);
  });

  const roleLabel = staff.isTeacher ? "Teacher" : staff.isFull ? "Admin" : "Staff";

  return (
    <AdminShell
      links={visible.map(({ href, label, group }) => ({ href, label, group }))}
      name={staff.name}
      roleLabel={roleLabel}
    >
      {children}
    </AdminShell>
  );
}
