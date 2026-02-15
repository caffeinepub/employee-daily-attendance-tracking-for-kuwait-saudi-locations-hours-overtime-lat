/**
 * Formats an ISO date string (YYYY-MM-DD) to "DD-MM-YYYY Mon" format
 * @param isoDate - Date string in YYYY-MM-DD format
 * @returns Formatted date string like "15-02-2026 Mon"
 */
export function formatDashboardDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  const weekdayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
  
  return `${day}-${month}-${year} ${weekdayShort}`;
}
