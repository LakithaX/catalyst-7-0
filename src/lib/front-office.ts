import type { SupabaseClient } from '@supabase/supabase-js';

export const FRONT_OFFICES = [
  { code: 'oGV', name: 'Outgoing Global Volunteer', color: '#b84b3d' },
  { code: 'oGT', name: 'Outgoing Global Talent', color: '#96734f' },
  { code: 'iGV', name: 'Incoming Global Volunteer', color: '#627e67' },
  { code: 'iGT', name: 'Incoming Global Talent', color: '#7a6987' },
] as const;

export const BACK_OFFICES = [
  { code: 'TM', name: 'Talent Management', color: '#b84b3d' },
  { code: 'EM', name: 'Expansions Management', color: '#96734f' },
  { code: 'BD', name: 'Business Development', color: '#627e67' },
  { code: 'PR', name: 'Public Relations', color: '#7a6987' },
  { code: 'MKT', name: 'Marketing', color: '#a16c7b' },
] as const;

export type OfficeKind = 'front' | 'back';

export function backOfficeCode(value: string | null | undefined): string {
  return BACK_OFFICES.find(office => office.code.toLowerCase() === value?.trim().toLowerCase())?.code || 'other';
}

export function frontOfficeCode(programme: string | null | undefined): string {
  return FRONT_OFFICES.find(office => office.code.toLowerCase() === programme?.trim().toLowerCase())?.code || 'other';
}

export async function loadOfficeCounts(db: Pick<SupabaseClient, 'from'>, signal?: AbortSignal) {
  const front: Record<string, number> = { oGV: 0, oGT: 0, iGV: 0, iGT: 0, other: 0 };
  const back: Record<string, number> = { TM: 0, EM: 0, BD: 0, PR: 0, MKT: 0, other: 0 };
  let loaded = 0;
  let total = 0;
  // Read only the two office fields, in pages. The directory's 200-row limit
  // must not truncate this chart. Use the actual returned length for server caps.
  do {
    const query = db.from('registrations').select('programme,function', { count: 'exact' })
      .order('id', { ascending: true }).range(loaded, loaded + 499);
    const { data, error, count } = await (signal ? query.abortSignal(signal) : query);
    if (error) throw error;
    if (count === null || !data) throw new Error('The office breakdown could not be loaded. Please try again.');
    total = count;
    if (!data.length && loaded < total) throw new Error('Registrations changed while loading. Please refresh the chart.');
    for (const row of data) {
      front[frontOfficeCode(row.programme)]++;
      back[backOfficeCode(row.function)]++;
    }
    loaded += data.length;
  } while (loaded < total);
  return { front, back, total: loaded };
}
