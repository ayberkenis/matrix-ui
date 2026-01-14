/**
 * Depth Shading - Simplified for performance
 */

/**
 * Get brightness multiplier for a row (far rows are dimmer)
 * Enhanced for better 2.5D effect
 */
export function getRowBrightness(row, totalRows) {
  const depth = row / Math.max(1, totalRows - 1);
  // More dramatic fade: 0.2 at top (far), 1.0 at bottom (near)
  // Exponential curve for more realistic depth perception
  const linear = 0.2 + depth * 0.8;
  const exponential = Math.pow(depth, 0.7);
  return 0.2 + exponential * 0.8;
}

/**
 * Generate color class based on value and depth
 * Returns CSS class name instead of inline style for performance
 */
export function getColorClass(value, brightness, isAgent, isHighTension) {
  if (isAgent) return 'agent';
  if (isHighTension) return 'tension';
  
  const intensity = Math.floor(value * brightness * 4); // 0-4 levels
  return `g${intensity}`;
}
