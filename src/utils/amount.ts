/**
 * Format centimes to human-readable MAD string.
 * formatMAD(15000)   → "150,00 MAD"
 * formatMAD(100)     → "1,00 MAD"
 * formatMAD(1500000) → "15 000,00 MAD"
 *
 * Uses manual formatting to avoid relying on Intl.NumberFormat locale support,
 * which is incomplete on React Native's Hermes engine.
 */
export function formatMAD(centimes: number): string {
  const absTotal = Math.abs(centimes);
  const dirhams = Math.floor(absTotal / 100);
  const cents = absTotal % 100;
  // Manual thousands grouping (space separator, French/Moroccan style)
  const dirhamsStr = dirhams.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const centsStr = cents.toString().padStart(2, '0');
  const sign = centimes < 0 ? '-' : '';
  return `${sign}${dirhamsStr},${centsStr} MAD`;
}
