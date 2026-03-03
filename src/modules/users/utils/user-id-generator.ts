export function generateUserId(manualPart?: string): string {
  // manualPart should be 5 digits
  let cleanManual = '00000'; // default
  
  if (manualPart) {
    // Remove non-digits and take first 5 digits
    cleanManual = manualPart.replace(/[^0-9]/g, '').slice(0, 5);
    // Pad with leading zeros if needed
    cleanManual = cleanManual.padStart(5, '0');
  }
  
  // Return 8 + 5 digits = 6 digits total
  return `8${cleanManual}`; // e.g., 8 + 12345 = 812345
}