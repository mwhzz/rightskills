/** Public storefront stays offline; /admin, login, and APIs stay open. */
export const MAINTENANCE_MODE = false;

export function isMaintenanceBypass(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/maintenance" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/")
  );
}
