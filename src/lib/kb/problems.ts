// What #4471 actually holds, one row per problem. causes.ts sorts a report by tenant and channel;
// it has no cause for a date that moved by one day, so those reports (desk-notes.json) are lifted out
// first. Every number on the page comes from here.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day';

export const PROBLEMS: Record<Problem, { title: string; what: string; issue: number }> = {
  parser: {
    title: 'Shared parser reads day-first dates month first',
    what: 'A day-first tenant books 3 October; the invite says 10 March.',
    issue: 1,
  },
  hint: {
    title: 'booking-v3 form hints MM/DD/YYYY to day-first tenants',
    what: 'People type what the hint says, month first; the form reads it day first.',
    issue: 2,
  },
  'one-day': {
    title: 'Bookings move by exactly one day',
    what: 'Tuesday becomes Monday; only June; Lisbon and Toronto see different days. A time zone shift, not a flip.',
    issue: 3,
  },
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem | 'unplaced' {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  intakeAgrees: number;
};

export function problemRows(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: ProblemRow[]; exported: number; unique: number } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<ProblemRow['problem'], Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const rows = [...by.entries()]
    .map(([problem, rs]) => {
      const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
      return {
        problem,
        reports: rs.length,
        tenants: new Set(rs.map((r) => r.tenant)).size,
        firstSeen: days[0],
        lastSeen: days[days.length - 1],
        intakeAgrees: rs.filter((r) => r.meta.intakeTag === problem).length,
      };
    })
    .sort((a, b) => b.reports - a.reports);
  return { rows, exported: all.filter((r) => r.mergedInto === ticket).length, unique: merged.length };
}
