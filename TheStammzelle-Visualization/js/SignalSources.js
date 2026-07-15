
// js/SignalSources.js
// Fixed coordinate origins acting as hormone pumps / niche zones.
/** 
 * 
 * 
 * IMPORTANT: Constants.js already declares CARDIO_SIGNAL_SOURCE and
 * ENDO_SIGNAL_SOURCE as the canonical {x, y} objects,and 
 * sketch.js repositions them once the canvas size is known (via setTimeout in setup()). 
 * This file does NOT redeclare those consts — doing so would throw a duplicate
 * declaration error, since plain <script> tags all share one global scope.
 * Instead it extends the *same* objects with field math + rendering, so there
 * is only ever one source of truth for each niche's position.
 
*/


Object.assign(CARDIO_SIGNAL_SOURCE, {
    label: 'Cardio Niche',
    hue: 15,       // matches CardioPrecursor hue in COLOR_MAP
    radius: 140,   // visual glow radius, in pixels
    strength: 1.0
});

Object.assign(ENDO_SIGNAL_SOURCE, {
    label: 'Endothelial Niche',
    hue: 200,      // matches Endothelial hue in COLOR_MAP
    radius: 140,
    strength: 0.85
});

// Central registry so other code can loop over "every niche" instead of
// hardcoding both names everywhere.
const SIGNAL_SOURCES = [CARDIO_SIGNAL_SOURCE, ENDO_SIGNAL_SOURCE];

/**
 * Scalar concentration of a source's morphogen at a given point in space.
 * Inverse-square decay: strong right at the source, fading fast with distance
 * (matches the "standard inverse-square law degradation" called out in the README).
 */
function getConcentrationAt(source, position) {
    const dist = p5.Vector.dist(position, createVector(source.x, source.y));
    const strength = source.strength !== undefined ? source.strength : 1.0;
    return strength / (1 + CONSTANTS.SIGNAL_DECAY_FACTOR * dist * dist);
}

/**
 * Unit vector pointing from a position toward a source — the direction a cell
 * should move to climb that source's gradient. Kept separate from
 * Forces.chemotaxis so this file owns "where signals come from" and Forces.js
 * owns "how hard to pull."
 */
function getGradientDirection(source, position) {
    const dir = createVector(source.x - position.x, source.y - position.y);
    if (dir.magSq() > 0) dir.normalize();
    return dir;
}

/**
 * Finds whichever registered source has the highest concentration at a point.
 * Useful for naive/uncommitted cells that haven't picked a lineage yet and are
 * effectively "choosing" which niche to respond to.
 */
function getStrongestSignalAt(position) {
    let best = null;
    let bestConcentration = -Infinity;

    for (const source of SIGNAL_SOURCES) {
        const c = getConcentrationAt(source, position);
        if (c > bestConcentration) {
            bestConcentration = c;
            best = source;
        }
    }

    return { source: best, concentration: bestConcentration };
}

/**
 * Draws a soft radial glow so each niche is visible on canvas instead of being
 * an invisible attractor. Call once per source inside draw(), before the
 * particle loop, so cells render on top of the glow rather than under it.
 *
 *   // in sketch.js draw(), before the particle loop:
 *   renderAllSignalSources();
 */
function renderSignalSource(source) {
    push();
    noStroke();
    const steps = 6;
    for (let i = steps; i > 0; i--) {
        const r = (source.radius / steps) * i;
        const alpha = map(i, steps, 0, 4, 30);
        fill(source.hue, 60, 40, alpha);
        ellipse(source.x, source.y, r * 2, r * 2);
    }
    pop();
}

function renderAllSignalSources() {
    for (const source of SIGNAL_SOURCES) {
        renderSignalSource(source);
    }
}