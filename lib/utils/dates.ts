import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";

export function formatDateDisplay(isoDate: string): string {
  const d = parseISO(isoDate);
  if (!isValid(d)) return isoDate;
  return format(d, "EEEE d 'de' MMMM", { locale: es });
}

export function formatDateShort(isoDate: string): string {
  const d = parseISO(isoDate);
  if (!isValid(d)) return isoDate;
  return format(d, "EEE d MMM", { locale: es });
}

export function formatDateEmailSubject(isoDate: string): string {
  const d = parseISO(isoDate);
  if (!isValid(d)) return isoDate;
  return format(d, "d MMM", { locale: es });
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseDate(isoDate: string): Date {
  return parseISO(isoDate);
}

export function isValidISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  return isValid(parseISO(value));
}
