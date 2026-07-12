// 本地时区偏移（东八区，UTC+8）
const LOCAL_TIMEZONE_OFFSET = 8 * 60;

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getLocalDateString(): string {
  const now = new Date();
  const local = new Date(now.getTime() + LOCAL_TIMEZONE_OFFSET * 60 * 1000);
  return local.toISOString().split('T')[0];
}

export function toLocalISOString(): string {
  const now = new Date();
  const offsetMs = LOCAL_TIMEZONE_OFFSET * 60 * 1000;
  const local = new Date(now.getTime() + offsetMs);
  return local.toISOString().replace('Z', '+08:00');
}

export function toLocalDisplayString(): string {
  const now = new Date();
  const offsetMs = LOCAL_TIMEZONE_OFFSET * 60 * 1000;
  const local = new Date(now.getTime() + offsetMs);
  const parts = local.toISOString().split('T');
  const datePart = parts[0];
  const timePart = parts[1].split('.')[0];
  return datePart + ' ' + timePart + ' (UTC+8)';
}

export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const DB_TS_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function convertDBTimestamp(ts: string | null | undefined): string | null | undefined {
  if (!ts) return ts;
  if (!DB_TS_RE.test(ts)) return ts;
  const local = new Date(ts + 'Z');
  local.setMinutes(local.getMinutes() + LOCAL_TIMEZONE_OFFSET);
  return local.toISOString().replace('Z', '+08:00');
}

export function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s+/g, ' ')
    .trim();
}