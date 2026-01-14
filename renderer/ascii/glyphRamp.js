/**
 * Glyph Ramp Configuration
 * Maps normalized values (0-1) to ASCII characters
 */

// Default Matrix-style glyph ramp (sparse to dense)
export const DEFAULT_GLYPH_RAMP = " .:-=+*#%@";

// Alternative ramps with more variety
export const GLYPH_RAMPS = {
  default: " .:-=+*#%@",
  minimal: " .-+#",
  blocks: " ░▒▓█",
  matrix: " .·:░▒▓█",
  dense: " ▒▓█",
  gradient: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  symbols: " ··:░▒▓█",
  letters: " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: " 0123456789",
  mixed: " .:-=+*#%@ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  tech: " ··:░▒▓█▓▒░:·· ",
  organic: " ··:░▒▓█▓▒░:·· ",
};

/**
 * Get glyph character from normalized value
 */
export function getGlyph(value, ramp = DEFAULT_GLYPH_RAMP) {
  const clamped = Math.max(0, Math.min(1, value));
  const index = Math.floor(clamped * (ramp.length - 1));
  return ramp[index] || ramp[0];
}
