

// DON'T add any particles here - this file is only for setting up the scene (membrane, cytoplasm)


import { world } from "./init_script.js";
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  cx,
  cy,
  ionConfig,
  MEMBRANE,
  CYTOPLASM,
  ION_POPULATION,
  ION_STATS,
  _createZeroIonDict
} from "./config.js";
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



export const LEAK_INDICES = [0, 1, 13, 14, 26, 27, 38, 39];

for (const idx of LEAK_INDICES) {
  const segment = MEMBRANE.segments[idx];
  if (segment?.render) {
    segment.render.fillStyle = "#300058"; // Reset channel segments to default color

  }
  // MEMBRANE.segments[idx].render.fillStyle = "#37ff00"; // Reset channel segments to default color
  // MEMBRANE.segments[idx].isSensor = true; // Make channel segments static

}
