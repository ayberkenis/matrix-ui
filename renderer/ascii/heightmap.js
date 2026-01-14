/**
 * Heightmap Generation - Optimized
 * Creates grid cells with district info for clear visualization
 */

/**
 * Simple deterministic noise function
 */
function noise(x, y, seed = 0) {
  const n = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Extract metric value from district
 */
function extractMetricValue(district) {
  if (typeof district.tension === 'number') {
    return district.tension > 1 ? district.tension / 100 : district.tension;
  }
  if (typeof district.population === 'number') {
    return Math.min(district.population / 1000, 1);
  }
  if (typeof district.food_stock === 'number') {
    return 1 - Math.min(district.food_stock / 100, 1);
  }
  return 0.3;
}

/**
 * Generate heightmap with clear district boundaries
 */
export function generateHeightmap(districts, width, height) {
  const cells = new Array(height);
  const districtCount = districts?.length || 0;
  
  if (districtCount === 0) {
    // Empty grid with noise pattern
    for (let y = 0; y < height; y++) {
      cells[y] = new Array(width);
      for (let x = 0; x < width; x++) {
        cells[y][x] = {
          value: 0.1 + noise(x, y) * 0.2,
          districtIdx: -1,
          isBoundary: false,
        };
      }
    }
    return { cells, width, height, districtCount: 0 };
  }
  
  // Calculate district column widths
  const districtWidth = Math.floor(width / districtCount);
  const districtValues = districts.map(extractMetricValue);
  
  // Pre-calculate boundary positions (consistent for all rows)
  // Boundaries separate districts: drawn between district i and i+1
  // This ensures perfect vertical alignment across ALL rows
  const boundaryPositions = new Set();
  for (let i = 1; i < districtCount; i++) {
    const boundaryX = i * districtWidth;
    // Only add if within bounds and not at the very start (x=0)
    if (boundaryX > 0 && boundaryX < width) {
      boundaryPositions.add(boundaryX);
    }
  }
  
  for (let y = 0; y < height; y++) {
    cells[y] = new Array(width);
    for (let x = 0; x < width; x++) {
      const districtIdx = Math.min(Math.floor(x / districtWidth), districtCount - 1);
      const localX = x - districtIdx * districtWidth;
      
      // Check if this is a boundary column (exact position check)
      const isBoundary = boundaryPositions.has(x);
      
      // Base value from district tension
      const baseValue = districtValues[districtIdx];
      
      // Add organic noise variation (not diagonal wave)
      const n1 = noise(x * 0.1, y * 0.1, districtIdx);
      const n2 = noise(x * 0.05, y * 0.08, districtIdx + 10);
      const variation = (n1 * 0.15) + (n2 * 0.1) - 0.1;
      
      // Depth gradient - bottom is more intense (closer to viewer)
      const depthGrad = (y / height) * 0.25;
      
      // Local position affects density (center vs edges of district)
      const centerDist = Math.abs(localX - districtWidth / 2) / (districtWidth / 2);
      const edgeFade = centerDist * 0.1;
      
      cells[y][x] = {
        value: Math.max(0, Math.min(1, baseValue + variation + depthGrad - edgeFade)),
        districtIdx,
        isBoundary,
      };
    }
  }
  
  return { cells, width, height, districtCount, boundaryPositions: Array.from(boundaryPositions) };
}
