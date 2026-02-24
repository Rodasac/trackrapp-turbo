/**
 * Parse a "YYYY-MM-DD" string to a local Date without UTC offset shifts.
 * Use this instead of `new Date(str)` which interprets the string as UTC midnight.
 */
export function parseDateString(str: string): Date {
  const parts = str.split("-").map(Number);
  return new Date(parts[0]!, parts[1]! - 1, parts[2]!);
}

/**
 * Serialize a Date back to "YYYY-MM-DD" using local calendar values.
 * Inverse of parseDateString.
 */
export function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
