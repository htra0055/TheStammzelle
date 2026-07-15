// js/Forces.js

// The mathematical engine: steering vectors for biological attraction, repulsion,
// and chemokinesis. Written as generic, reusable functions (not tied to `this`)
// so Particle.js — or any future module — can call them without re-deriving the
// vector math every time. Nothing here mutates state; every function returns a
// fresh p5.Vector force for the caller to add into its own totalForce.

// Local tuning defaults. Move any of these into Constants.js if you want them
// configurable from one place — they're kept here for now since Constants.js
// doesn't define DETECTION_RADIUS / DESIRED_SEPARATION yet.

const FORCE_DEFAULTS = {
    DETECTION_RADIUS: 60,       // how far a cell can "sense" a neighbor
    DESIRED_SEPARATION: 16,     // minimum comfortable gap between cell centers
    COHESION_STRENGTH: 0.0015,
    SEPARATION_STRENGTH: 0.05,
    ALIGNMENT_STRENGTH: 0.03,
    BOUNDARY_MARGIN: 50,
    BOUNDARY_STRENGTH: 0.06
};

const Forces = {

    /**
     * CHEMOTAXIS — pulls a particle toward a single signal source.
     * Field strength decays with the inverse square of distance (per the README
     * spec), so a cell barely feels a source until it's relatively close to it.
     *
     * @param {p5.Vector} position     the sensing cell's position
     * @param {{x:number,y:number}} source  a signal source (e.g. CARDIO_SIGNAL_SOURCE)
     * @param {number} strengthMultiplier   overall pull scale
     */
    chemotaxis(position, source, strengthMultiplier = 0.015) {
        const force = createVector(0, 0);
        if (!source) return force;

        const sourcePos = createVector(source.x, source.y);
        const dist = max(p5.Vector.dist(position, sourcePos), 1); // guard against /0
        const fieldStrength = 1 / (1 + CONSTANTS.SIGNAL_DECAY_FACTOR * dist * dist);

        force.set(sourcePos.x - position.x, sourcePos.y - position.y);
        force.normalize();
        force.mult(fieldStrength * strengthMultiplier);
        return force;
    },

    /**
     * COHESION — steer toward the average position of nearby same-type cells.
     * Stops a lineage from drifting apart once it starts forming tissue.
     */
    cohesion(particle, allParticles, radius = FORCE_DEFAULTS.DETECTION_RADIUS, strength = FORCE_DEFAULTS.COHESION_STRENGTH) {
        const force = createVector(0, 0);
        const sum = createVector(0, 0);
        let count = 0;

        for (const other of allParticles) {
            if (other === particle || other.cellType !== particle.cellType) continue;
            const d = p5.Vector.dist(particle.position, other.position);
            if (d > 0 && d < radius) {
                sum.add(other.position);
                count++;
            }
        }

        if (count > 0) {
            sum.div(count);
            force.set(sum.x - particle.position.x, sum.y - particle.position.y);
            force.normalize();
            force.mult(strength);
        }

        return force;
    },

    /**
     * SEPARATION — push away from ANY cell (regardless of type) crowding closer
     * than the desired packing density, so tissue keeps structure instead of
     * collapsing into a formless blob.
     */
    separation(particle, allParticles, desiredSeparation = FORCE_DEFAULTS.DESIRED_SEPARATION, strength = FORCE_DEFAULTS.SEPARATION_STRENGTH) {
        const force = createVector(0, 0);

        for (const other of allParticles) {
            if (other === particle) continue;
            const d = p5.Vector.dist(particle.position, other.position);
            const minGap = desiredSeparation + particle.radius + other.radius;

            if (d > 0 && d < minGap) {
                const push = createVector(particle.position.x - other.position.x, particle.position.y - other.position.y);
                push.normalize();
                push.mult(map(d, 0, minGap, strength, 0));
                force.add(push);
            }
        }

        return force;
    },

    /**
     * ALIGNMENT — steer to match the average heading of nearby same-type
     * neighbors. This is what lets sheets/tubes/spirals move as a coherent
     * structure instead of a swarm of independently-jittering cells.
     */
    alignment(particle, allParticles, radius = FORCE_DEFAULTS.DETECTION_RADIUS, strength = FORCE_DEFAULTS.ALIGNMENT_STRENGTH) {
        const force = createVector(0, 0);
        const avgVelocity = createVector(0, 0);
        let count = 0;

        for (const other of allParticles) {
            if (other === particle || other.cellType !== particle.cellType) continue;
            const d = p5.Vector.dist(particle.position, other.position);
            if (d > 0 && d < radius) {
                avgVelocity.add(other.velocity);
                count++;
            }
        }

        if (count > 0) {
            avgVelocity.div(count);
            force.set(avgVelocity.x - particle.velocity.x, avgVelocity.y - particle.velocity.y);
            force.limit(strength);
        }

        return force;
    },

    /**
     * BOUNDARY AVOIDANCE — a soft push away from canvas edges, meant to be
     * applied before the hard bounce-and-energy-penalty logic already in
     * Particle.js kicks in. Makes motion near walls read more like a living
     * membrane than a ping-pong ball.
     */
    boundaryAvoidance(position, margin = FORCE_DEFAULTS.BOUNDARY_MARGIN, strength = FORCE_DEFAULTS.BOUNDARY_STRENGTH) {
        const force = createVector(0, 0);

        if (position.x < margin) {
            force.x += map(position.x, 0, margin, strength, 0);
        } else if (position.x > width - margin) {
            force.x -= map(position.x, width - margin, width, 0, strength);
        }

        if (position.y < margin) {
            force.y += map(position.y, 0, margin, strength, 0);
        } else if (position.y > height - margin) {
            force.y -= map(position.y, height - margin, height, 0, strength);
        }

        return force;
    }
};