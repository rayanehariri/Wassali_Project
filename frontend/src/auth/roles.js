/**
 * Map API role strings to app roles: 'client' | 'deliverer' | 'admin'
 */
export function normalizeRole(role) {
  if (role == null) return "";
  const s = String(role).toLowerCase().trim();
  if (["deliverer", "driver", "courier", "rider"].includes(s)) return "deliverer";
  if (["admin", "administrator", "superadmin", "operator"].includes(s)) return "admin";
  if (["client", "customer", "user", "sender", "member"].includes(s)) return "client";
  return s;
}
