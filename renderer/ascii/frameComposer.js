/**
 * Frame Composer - Highly Optimized
 * Renders rows as styled segments instead of individual characters
 */

import { generateHeightmap } from './heightmap';
import { getGlyph, GLYPH_RAMPS, DEFAULT_GLYPH_RAMP } from './glyphRamp';
import { getRowBrightness } from './depthShading';
import { createAgentMap } from './agentOverlay';

// District boundary characters (variety for visual interest)
const BOUNDARY_CHARS = ['│', '║', '┃', '│'];
const BOUNDARY_CHAR = '│';
const DISTRICT_LABEL_ROW = 1;

// Special event/alert characters
const EVENT_CHARS = {
  high_tension: '⚠',
  food_shortage: '⚡',
  riot: '🔥',
  migration: '⇄',
  aid: '✚',
};

/**
 * Compose a frame optimized for rendering
 * Returns rows as arrays of segments (runs of same-styled characters)
 */
export function composeFrame(districts, agents, width, height, options = {}) {
  const {
    glyphRamp = DEFAULT_GLYPH_RAMP,
    showAgents = true,
    maxAgents = 200,
  } = options;
  
  const ramp = GLYPH_RAMPS[glyphRamp] || glyphRamp;
  const districtCount = districts?.length || 0;
  
  // Generate heightmap
  const heightmap = generateHeightmap(districts, width, height);
  
  // Create agent position map - pass full districts array for name matching
  const agentMap = showAgents 
    ? createAgentMap(agents, width, height, districts, maxAgents)
    : new Map();
  
  // Build district labels and event indicators
  const districtLabels = buildDistrictLabels(districts, width);
  const eventIndicators = buildEventIndicators(districts, width, height);
  
  // Compose rows as segments and build character metadata map for tooltips
  const rows = [];
  const charMetadata = new Map(); // Map of "x,y" -> metadata object
  
  for (let y = 0; y < height; y++) {
    const brightness = getRowBrightness(y, height);
    const segments = [];
    let currentSegment = null;
    
    for (let x = 0; x < width; x++) {
      const cell = heightmap.cells[y]?.[x];
      const agentKey = `${x},${y}`;
      const agent = agentMap.get(agentKey);
      
      let char, colorType, intensity;
      
      // Store metadata for tooltips
      let metadata = null;
      
      // Boundaries take absolute priority - always draw them as solid vertical lines
      // This ensures perfect vertical alignment across all rows
      if (cell?.isBoundary) {
        // Vary boundary character slightly for visual interest (but keep it consistent per column)
        const boundaryCharIdx = x % BOUNDARY_CHARS.length;
        char = BOUNDARY_CHARS[boundaryCharIdx];
        colorType = 'boundary';
        intensity = 0.8; // Slightly brighter for better visibility
        metadata = {
          type: 'boundary',
          description: 'District Boundary',
          char: char,
        };
      } else if (agent) {
        // Agent glyph (not on boundaries)
        char = agent.glyph;
        colorType = agent.isAlive ? 'agent' : 'dead';
        intensity = 1;
        // Use the agent object stored in agentMap
        const actualAgent = agent.agent || agent;
        metadata = {
          type: 'agent',
          description: getAgentDescription(agent, actualAgent),
          char: char,
          agent: actualAgent,
        };
      } else if (y === DISTRICT_LABEL_ROW && districtLabels[x]) {
        // District label character
        char = districtLabels[x];
        colorType = 'label';
        intensity = 1;
        const districtIdx = Math.floor(x / Math.floor(width / districtCount));
        const district = districts[districtIdx];
        metadata = {
          type: 'label',
          description: district ? `District: ${district.name || district.id}` : 'District Label',
          char: char,
        };
      } else if (eventIndicators[`${x},${y}`]) {
        // Event indicator (takes priority over terrain but not boundaries/agents)
        const event = eventIndicators[`${x},${y}`];
        char = event.char;
        colorType = 'event';
        intensity = 1;
        metadata = {
          type: 'event',
          description: getEventDescription(event.type),
          char: char,
          eventType: event.type,
        };
      } else {
        // Terrain glyph with enhanced variety
        const value = cell?.value ?? 0;
        const districtIdx = cell?.districtIdx ?? -1;
        
        // Add special characters for extreme values
        if (value > 0.95) {
          // Maximum tension - use special warning glyph
          char = '█';
        } else if (value > 0.85) {
          // Very high tension - use dense block
          char = '▓';
        } else if (value < 0.05) {
          // Very low tension - use minimal glyph
          char = ' ';
        } else {
          // Normal range - use standard glyph ramp
          char = getGlyph(value, ramp);
        }
        
        // Add district number indicator for first few rows (very subtle, only on sparse areas)
        if (y < 2 && districtIdx >= 0 && districtIdx < 10 && value < 0.3) {
          // Only show on very sparse/low tension areas to avoid visual clutter
          const shouldShow = (x + y * width) % 25 === 0;
          if (shouldShow) {
            char = String(districtIdx);
            colorType = 'label'; // Use label color for district numbers
            intensity = 0.6; // Dimmed
          }
        }
        
        // Color based on tension level
        if (value > 0.7) {
          colorType = 'high';
        } else if (value > 0.4) {
          colorType = 'medium';
        } else {
          colorType = 'low';
        }
        intensity = brightness;
        
        // Terrain metadata
        const district = districtIdx >= 0 && districtIdx < districts.length ? districts[districtIdx] : null;
        metadata = {
          type: 'terrain',
          description: getTerrainDescription(value, district, char),
          char: char,
          value: value,
          district: district,
        };
      }
      
      // Store metadata for this position
      if (metadata) {
        charMetadata.set(`${x},${y}`, metadata);
      }
      
      // Boundaries always get their own segment to ensure perfect vertical alignment
      const segmentKey = colorType === 'boundary' 
        ? `boundary-${x}` // Unique key per boundary position
        : `${colorType}-${Math.floor(intensity * 3)}`;
      
      // Batch consecutive same-styled characters (but boundaries are always separate)
      if (currentSegment && currentSegment.key === segmentKey && colorType !== 'boundary') {
        currentSegment.text += char;
      } else {
        if (currentSegment) {
          segments.push(currentSegment);
        }
        currentSegment = {
          key: segmentKey,
          text: char,
          colorType,
          intensity,
        };
      }
    }
    
    if (currentSegment) {
      segments.push(currentSegment);
    }
    
    // Enhanced 2.5D compression - more dramatic perspective
    const depth = y / Math.max(1, height - 1);
    const compression = 0.3 + depth * 0.7; // More dramatic: 0.3 at top, 1.0 at bottom
    
    rows.push({
      segments,
      compression,
      depth, // Add depth for additional effects
    });
  }
  
  return {
    rows,
    width,
    height,
    charMetadata, // Add metadata map for tooltips
    stats: {
      districtCount,
      agentCount: agents?.length || 0,
      visibleAgents: agentMap.size,
    },
  };
}

/**
 * Get description for agent glyph
 */
function getAgentDescription(agentData, actualAgent) {
  const agent = actualAgent || agentData;
  const role = agent?.role || 'Unknown';
  const name = agent?.name || 'Agent';
  const action = agent?.current_action || 'idle';
  const mood = agent?.mood;
  const moodStr = typeof mood === 'number' ? ` (Mood: ${(mood * 100).toFixed(0)}%)` : '';
  return `${name} - ${role}${moodStr}${action !== 'idle' ? ` - ${action}` : ''}`;
}

/**
 * Get description for event indicator
 */
function getEventDescription(eventType) {
  const descriptions = {
    riot: 'Riot Risk - High social tension',
    food: 'Food Shortage - Low food stock',
    migration: 'Migration Risk - Population movement',
    tension: 'High Tension - Elevated stress levels',
  };
  return descriptions[eventType] || `Event: ${eventType}`;
}

/**
 * Get description for terrain glyph
 */
function getTerrainDescription(value, district, char) {
  const tension = district?.tension;
  const tensionStr = typeof tension === 'number' ? ` (Tension: ${tension.toFixed(1)})` : '';
  const valuePercent = (value * 100).toFixed(0);
  
  if (value > 0.95) {
    return `Maximum Density${tensionStr} - Critical tension level`;
  } else if (value > 0.85) {
    return `Very High Density${tensionStr} - ${valuePercent}%`;
  } else if (value > 0.7) {
    return `High Density${tensionStr} - ${valuePercent}%`;
  } else if (value > 0.4) {
    return `Medium Density${tensionStr} - ${valuePercent}%`;
  } else if (value > 0.1) {
    return `Low Density${tensionStr} - ${valuePercent}%`;
  } else {
    return `Sparse Area${tensionStr} - Minimal activity`;
  }
}

/**
 * Build district name labels as character array with enhanced formatting
 */
function buildDistrictLabels(districts, width) {
  const labels = {};
  if (!districts || districts.length === 0) return labels;
  
  const districtWidth = Math.floor(width / districts.length);
  
  districts.forEach((district, idx) => {
    const name = (district.name || `D${idx}`).substring(0, districtWidth - 4).toUpperCase();
    const startX = idx * districtWidth + 2;
    
    // Add district number prefix if space allows
    const prefix = idx < 10 ? `${idx}` : '';
    let labelStart = startX;
    
    if (prefix && districtWidth > 6) {
      labels[labelStart] = prefix;
      labelStart += 1;
    }
    
    // Add name characters
    for (let i = 0; i < name.length && labelStart + i < width; i++) {
      labels[labelStart + i] = name[i];
    }
    
    // Add tension indicator if very high
    if (district.tension > 80 && labelStart + name.length + 1 < width) {
      labels[labelStart + name.length] = '!';
    }
  });
  
  return labels;
}

/**
 * Build event indicators for districts with active events
 */
function buildEventIndicators(districts, width, height) {
  const indicators = {};
  if (!districts || districts.length === 0) return indicators;
  
  const districtWidth = Math.floor(width / districts.length);
  
  districts.forEach((district, idx) => {
    // Check for risk flags and recent events
    const hasRiot = district.risk_flags?.riot_risk;
    const hasFoodShortage = district.recent_events?.some(e => 
      e.type?.includes('food') || e.type === 'food_shortage_wave'
    );
    const hasMigration = district.risk_flags?.migration_risk;
    const hasHighTension = district.tension > 70;
    
    // Place event indicators in the district (scattered)
    const startX = idx * districtWidth + 1;
    const endX = Math.min((idx + 1) * districtWidth - 1, width - 1);
    const centerX = Math.floor((startX + endX) / 2);
    
    // Place indicators at different rows for visibility
    if (hasRiot) {
      const y = Math.floor(height * 0.3);
      const x = centerX;
      indicators[`${x},${y}`] = { char: EVENT_CHARS.riot, type: 'riot' };
    }
    if (hasFoodShortage) {
      const y = Math.floor(height * 0.5);
      const x = centerX - 2;
      indicators[`${x},${y}`] = { char: EVENT_CHARS.food_shortage, type: 'food' };
    }
    if (hasMigration) {
      const y = Math.floor(height * 0.7);
      const x = centerX + 2;
      indicators[`${x},${y}`] = { char: EVENT_CHARS.migration, type: 'migration' };
    }
    if (hasHighTension && !hasRiot) {
      const y = Math.floor(height * 0.4);
      const x = centerX + 1;
      indicators[`${x},${y}`] = { char: EVENT_CHARS.high_tension, type: 'tension' };
    }
  });
  
  return indicators;
}

/**
 * Create empty placeholder frame
 */
export function createPlaceholderFrame(width, height, message = 'LOADING...') {
  const rows = [];
  const msgRow = Math.floor(height / 2);
  const msgStart = Math.floor((width - message.length) / 2);
  
  for (let y = 0; y < height; y++) {
    if (y === msgRow) {
      const before = ' '.repeat(msgStart);
      const after = ' '.repeat(width - msgStart - message.length);
      rows.push({
        segments: [
          { key: 'empty', text: before, colorType: 'low', intensity: 0.2 },
          { key: 'msg', text: message, colorType: 'label', intensity: 1 },
          { key: 'empty2', text: after, colorType: 'low', intensity: 0.2 },
        ],
        compression: 1,
      });
    } else {
      rows.push({
        segments: [{ key: 'empty', text: ' '.repeat(width), colorType: 'low', intensity: 0.1 }],
        compression: 1,
      });
    }
  }
  
  return {
    rows,
    width,
    height,
    stats: { districtCount: 0, agentCount: 0, visibleAgents: 0 },
  };
}
