/** Returns the UTC offset in minutes for a given timezone at the reference date */
function getTzOffsetMins(tz: string, ref: Date): number {
  const noonUTC = new Date(Date.UTC(ref.getFullYear(), ref.getMonth(), ref.getDate(), 12, 0, 0));
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: false,
  }).formatToParts(noonUTC);
  const h = Number(parts.find((p) => p.type === 'hour')?.value ?? '12');
  const m = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return h * 60 + m - 720; // offset vs UTC in minutes
}

/** Parse a time slot string like "6:30 AM" → { hour, min } in 24h */
function parseSlot(slot: string): { hour: number; min: number } {
  const [timePart, period] = slot.split(' ');
  const [h, m = '0'] = timePart.split(':');
  let hour = Number(h);
  const min = Number(m);
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return { hour, min };
}

/**
 * Convert a slot string (in tutorTz) to a formatted time string in userTz.
 * Falls back to the original slot string on error.
 */
export function slotToUserTime(slot: string, tutorTz: string, userTz: string): string {
  try {
    const today = new Date();
    const tutorOffsetMins = getTzOffsetMins(tutorTz, today);
    const { hour, min } = parseSlot(slot);
    const todayMidUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const slotUTCMs = todayMidUTC + ((hour * 60 + min) - tutorOffsetMins) * 60000;
    return new Intl.DateTimeFormat('en-US', {
      timeZone: userTz, hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date(slotUTCMs));
  } catch {
    return slot;
  }
}

/** Returns the short timezone abbreviation, e.g. "IST", "BST", "EST" */
export function tzAbbr(tz: string): string {
  try {
    return (
      new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short' })
        .formatToParts(new Date())
        .find((p) => p.type === 'timeZoneName')?.value ?? tz
    );
  } catch {
    return tz;
  }
}
