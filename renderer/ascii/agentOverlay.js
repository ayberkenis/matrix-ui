/**
 * Agent Overlay - Optimized for large populations
 */

// Distinct glyphs for different agent states and roles
const AGENT_GLYPHS = {
  // Basic states
  alive: '◉',
  dead: '✕',
  active: '◎',
  
  // Roles
  leader: '★',
  trader: '◆',
  worker: '●',
  scout: '▲',
  builder: '■',
  farmer: '◊',
  guard: '▼',
  merchant: '♦',
  artisan: '◈',
  scholar: '◐',
  healer: '◑',
  warrior: '◒',
  diplomat: '◓',
  
  // Mood-based (fallback if role not found)
  happy: '○',
  sad: '●',
  angry: '◉',
  fearful: '◯',
  
  // Action-based
  moving: '→',
  working: '⚒',
  resting: '◌',
  eating: '◍',
};

/**
 * Sample and position agents efficiently
 * Returns a Map for O(1) lookup
 */
export function createAgentMap(agents, gridWidth, gridHeight, districts, maxAgents = 200) {
  const agentMap = new Map();
  const districtCount = districts?.length || 0;
  
  if (!agents || agents.length === 0 || districtCount === 0) {
    return agentMap;
  }
  
  const districtWidth = Math.floor(gridWidth / districtCount);
  
  // Pre-calculate boundary positions to avoid placing agents there
  // Must match the calculation in heightmap.js EXACTLY
  const boundaryPositions = new Set();
  for (let i = 1; i < districtCount; i++) {
    const boundaryX = i * districtWidth;
    // Only add if within bounds and not at the very start (x=0)
    if (boundaryX > 0 && boundaryX < gridWidth) {
      boundaryPositions.add(boundaryX);
    }
  }
  
  // Build district name to index mapping
  const districtNameToIdx = new Map();
  districts.forEach((d, idx) => {
    const id = String(d.id ?? d.name ?? idx);
    const name = d.name ?? `district_${idx}`;
    districtNameToIdx.set(id, idx);
    districtNameToIdx.set(name, idx);
    districtNameToIdx.set(name.toLowerCase(), idx);
    if (name.includes('_')) {
      districtNameToIdx.set(name.split('_').pop(), idx);
    }
  });
  
  // Sample agents uniformly if too many
  let sampledAgents = agents;
  if (agents.length > maxAgents) {
    const step = agents.length / maxAgents;
    sampledAgents = [];
    for (let i = 0; i < maxAgents; i++) {
      sampledAgents.push(agents[Math.floor(i * step)]);
    }
  }
  
  // Position each agent in their district (avoiding boundaries)
  sampledAgents.forEach((agent, agentIdx) => {
    const agentDistrict = agent.district ?? agent.location ?? 'unknown';
    
    let districtIdx = districtNameToIdx.get(agentDistrict);
    if (districtIdx === undefined) {
      districtIdx = districtNameToIdx.get(String(agentDistrict).toLowerCase());
    }
    if (districtIdx === undefined) {
      districtIdx = agentIdx % districtCount;
    }
    
    // Start after boundary (+1), leave room before next boundary (-2)
    const startX = districtIdx * districtWidth + 1;
    const endX = Math.min((districtIdx + 1) * districtWidth - 1, gridWidth - 1);
    const colRange = Math.max(1, endX - startX);
    
    // Pseudo-random but deterministic position within district
    const hash = (agentIdx * 31 + districtIdx * 17) % 1000;
    let x = startX + Math.floor((hash % colRange));
    const y = Math.floor(gridHeight * 0.08) + Math.floor((hash / 1000) * gridHeight * 0.8);
    
    // Ensure we don't land on a boundary
    if (boundaryPositions.has(x)) {
      x = Math.min(x + 1, endX);
    }
    
    const key = `${x},${y}`;
    if (!agentMap.has(key)) {
      agentMap.set(key, {
        glyph: getAgentGlyph(agent),
        mood: agent.mood,
        isAlive: agent.is_alive !== false,
        agent: agent, // Store full agent object for tooltips
      });
    }
  });
  
  return agentMap;
}

function getAgentGlyph(agent) {
  // Dead agents always show dead glyph
  if (agent.is_alive === false) return AGENT_GLYPHS.dead;
  
  // Check for specific roles first
  const role = (agent.role || '').toLowerCase();
  if (role && AGENT_GLYPHS[role]) {
    return AGENT_GLYPHS[role];
  }
  
  // Check current action for movement/activity
  const action = (agent.current_action || '').toLowerCase();
  if (action) {
    if (action.includes('move') || action.includes('travel')) return AGENT_GLYPHS.moving;
    if (action.includes('work') || action.includes('build')) return AGENT_GLYPHS.working;
    if (action.includes('rest') || action.includes('sleep')) return AGENT_GLYPHS.resting;
    if (action.includes('eat') || action.includes('meal')) return AGENT_GLYPHS.eating;
  }
  
  // Check mood for emotional state
  const mood = agent.mood;
  if (typeof mood === 'number') {
    if (mood > 0.7) return AGENT_GLYPHS.happy;
    if (mood < 0.3) return AGENT_GLYPHS.sad;
    if (mood < 0.1) return AGENT_GLYPHS.fearful;
  }
  
  // Default: active if has action, otherwise alive
  return agent.current_action ? AGENT_GLYPHS.active : AGENT_GLYPHS.alive;
}
