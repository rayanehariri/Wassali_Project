import { normalizeRole } from '../auth/roles';

/** Main dashboard entry for the logged-in role */
export function getDashboardPath(user) {
  const r = normalizeRole(user?.role);
  if (r === 'admin') return '/dashboard';
  if (r === 'deliverer') return '/deliverer-dashboard';
  return '/client-dashboard';
}

/** Account / profile destination: settings for client & admin, profile for deliverer */
export function getAccountPath(user) {
  const r = normalizeRole(user?.role);
  if (r === 'admin') return '/dashboard/settings';
  if (r === 'deliverer') return '/deliverer-dashboard/profile';
  return '/client-dashboard?view=settings';
}
