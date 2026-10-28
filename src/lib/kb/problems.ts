// What #4471 actually holds, one row per problem, counted with the desk's own view (causes.ts):
// a report counts under the cause its tenant and channel give it. The reports the desk read as a
// one-day move (desk-notes.json) stay counted where they are filed and get a row of their own,
// because they are a different bug. Every number on the page comes from here.
import { groupByCause, readAs, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

export const PROBLEMS: Record<Problem, { title: string; issue: number }> = {
  parser: { title: 'Shared parser reads day-first dates month first', issue: 1 },
  hint: { title: 'booking-v3 form hints MM/DD/YYYY to day-first tenants', issue: 2 },
  'one-day': { title: 'Bookings move by exactly one day (time zone)', issue: 3 },
};

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  filedUnder?: string;
};

export function problemRows(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: ProblemRow[]; exported: number; unique: number } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
  }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
  const filedUnder = groups.filter((g) => readAs(g, oneDayMove) > 0).map((g) => g.cause).join(', ');
  if (moved.length)
    rows.push({
      problem: 'one-day',
      reports: moved.length,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      filedUnder,
    });
  return { rows, exported: all.filter((r) => r.mergedInto === ticket).length, unique: merged.length };
}
