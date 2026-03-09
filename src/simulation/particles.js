

import { world } from "./init.js";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  cx,
  cy,
  ionConfig,
  CYTOPLASM,
  MEMBRANE,
  ION_POPULATION,
  ION_STATS,
  LEAK_INDICES,
  LEAK_CONFIG
} from "../config/config.js";
const { Bodies, World } = Matter;


/**
 * Helper function. 
 * Avoid using directly - use createParticle instead, which also adds an ion to rendered list and updates the ION_STATS.TOTAL_IONS_COUNT object.
 * 
 * @param {string} name - The name of the particle
 * @param {number|null} x
 * @param {number|null} y
 * @param {number|null} radius
 * @param {string|null} color
 */
export function _createParticle(
  name, // e.g, 
  x = null,
  y = null,
  radius = null,
  color = null) {
  const cfg = ionConfig[name] || {};
  if (!cfg) throw new Error(`Unkown ion: ${name}`);

  const _x = x ?? Math.random() * (CANVAS_WIDTH * 0.7); // 70% of canvas for safety margin
  const _y = y ?? Math.random() * (CANVAS_HEIGHT * 0.7); // 70% of canvas for safety margin
  const _radius = radius ?? cfg.radius;
  const _color = color ?? cfg.color;
  const _name = name;
  const _charge = cfg.charge;

  const particle = Bodies.circle(
    _x,
    _y,
    _radius,
    {
      isStatic: false,
      render: { fillStyle: _color }
    }
  );
  particle.charge = _charge;
  particle.name = _name;
  particle.color = _color

  return particle;
}

/**
 * 1. Creates a particle; 
 * 2. Adds a particle to rendering population; 
 * 3. Updates the ION_STATS.TOTAL_IONS_COUNT object for that ion type.
 * 
 * @param {string} name - The name of the particle
 * @param {number|null} x
 * @param {number|null} y
 * @param {number|null} radius
 * @param {string|null} color
 */
export function createParticle(name, x = null, y = null, radius = null, color = null) {
  const particle = _createParticle(name, x, y, radius, color);
  ION_POPULATION.push(particle);
  ION_STATS.TOTAL_IONS_COUNT[particle.name] = (ION_STATS.TOTAL_IONS_COUNT[particle.name] || 0) + 1;
  World.add(world, particle);
  return particle;
}

// A helper function that returns random x,y coordinates for spawning in a given area range
function _randomPointInRing(minRadius, maxRadius) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(
    Math.random() * (maxRadius * maxRadius - minRadius * minRadius) + minRadius * minRadius
  );

  return {
    x: cx + Math.cos(angle) * radius,
    y: cy + Math.sin(angle) * radius
  };
}

function spawnIonsByCompartment(ionName, count, compartment) {
  const particleRadius = ionConfig[ionName]?.radius ?? 0;
  const spawnPadding = 6;
  const canvasEdgeRadius = Math.min(cx, cy, CANVAS_WIDTH - cx, CANVAS_HEIGHT - cy) - particleRadius - 2;

  let minRadius = 0;
  let maxRadius = 0;

  if (compartment === "inside") {
    minRadius = 0;
    maxRadius = Math.max(0, CYTOPLASM.radius - particleRadius - spawnPadding);
  } else if (compartment === "outside") {
    minRadius = MEMBRANE.radius + MEMBRANE.segment_thickness / 2 + particleRadius + spawnPadding;
    maxRadius = Math.max(minRadius + 1, canvasEdgeRadius);
  } else {
    throw new Error(`Unknown compartment: ${compartment}`);
  }

  for (let i = 0; i < count; i++) {
    const position = _randomPointInRing(minRadius, maxRadius);
    createParticle(ionName, position.x, position.y);
  }
}

/**
 * Prefills the simulation with default Na/K distribution:
 * Na: 8 inside, 92 outside
 * K: 97 inside, 3 outside
 */
export function prefillDefaultIons() {
  spawnIonsByCompartment("Na", 8, "inside");
  spawnIonsByCompartment("Na", 92, "outside");

  // spawnIonsByCompartment("K", 97, "inside");
  // spawnIonsByCompartment("K", 3, "outside");

  // spawnIonsByCompartment("Cl", 8, "inside");
  // spawnIonsByCompartment("Cl", 91, "outside");

  // spawnIonsByCompartment("Ca", 1, "inside");
  // spawnIonsByCompartment("Ca", 99, "outside");

  // spawnIonsByCompartment("Mg", 33, "inside");
  // spawnIonsByCompartment("Mg", 67, "outside");
}

// move to init later
for (const [ionName, cfg] of Object.entries(LEAK_CONFIG)) {
  for (const idx of cfg.segment_indices) {
    const segment = MEMBRANE.segments[idx];
    if (segment?.render) {
      segment.render.fillStyle = "#300058"; // Reset channel segments to default color

    }
  }
}

for (const idx of LEAK_INDICES) {
  const segment = MEMBRANE.segments[idx];
  if (segment?.render) {

  }
}

prefillDefaultIons();
