/**
 * Format centimes to human-readable MAD string.
 * formatMAD(15000) → "150,00 MAD"
 * formatMAD(100)   → "1,00 MAD"
 */
export function formatMAD(centimes: number): string {
  const dirhams = Math.floor(centimes / 100);
  const cents = Math.abs(centimes % 100);
  // Use Moroccan/French format: thousands separator is space, decimal is comma
  const formattedDirhams = dirhams.toLocaleString('fr-MA');
  const formattedCents = cents.toString().padStart(2, '0');
  return `${formattedDirhams},${formattedCents} MAD`;
}
