/** Parse a timezone-free `YYYY-MM-DD` as UTC midnight so the calendar day never shifts. */
export function parseTripDate(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}
