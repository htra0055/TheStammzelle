// js/Particle.js: Defines what a single cell is, its properties, and its behavior over time.

// class Particle {
//     constructor(x, y, cellType) {
//         this.position = createVector(x, y);
//         this.velocity = createVector(0, 0);
//         this.radius = random(2, 4);
//         this.energy = 100;
//         this.cellType = cellType;
//         this.stage = 'Naive';
//     }

//     update() {
//         let totalForce = createVector(0, 0);
//         totalForce.add(this.getSignalPull());
//         totalForce.add(this.getAlignmentForce(particles));

//         const wander = p5.Vector.random2D().mult(random(0.1, 0.4));
//         totalForce.add(wander);

//         this.velocity.add(totalForce);
//         this.velocity.mult(0.94);
//         this.velocity.limit(3);
//         this.position.add(this.velocity);

//         if (this.position.x <= 0 || this.position.x >= width) {
//             this.velocity.x *= -0.8;
//             this.energy -= 0.6;
//         }
//         if (this.position.y <= 0 || this.position.y >= height) {
//             this.velocity.y *= -0.8;
//             this.energy -= 0.6;
//         }

//         this.position.x = constrain(this.position.x, 0, width);
//         this.position.y = constrain(this.position.y, 0, height);

//         this.energy -= 0.15;
//         this.radius = constrain(this.radius + random(-0.002, 0.003), 1.4, 4.5);
//         this.checkCommitment();
//     }

//     checkCollisions(otherParticles) {
//         for (let other of otherParticles) {
//             if (other === this) continue;

//             const dx = other.position.x - this.position.x;
//             const dy = other.position.y - this.position.y;
//             const distance = Math.sqrt(dx * dx + dy * dy);

//             if (this.cellType === other.cellType && distance < 60) {
//                 const attractionPull = createVector(dx, dy);
//                 attractionPull.normalize();
//                 attractionPull.mult(map(distance, 0, 60, 0.025, 0.001));
//                 this.velocity.add(attractionPull);
//             }

//             if (distance < this.radius + other.radius + 2) {
//                 const push = createVector(this.position.x - other.position.x, this.position.y - other.position.y);
//                 push.normalize();
//                 push.mult(map(distance, 0, this.radius + other.radius + 2, 0.03, 0.005));
//                 this.velocity.add(push);
//             }
//         }

//         this.velocity.limit(2.2);
//     }

//     isAlive() {
//         return this.energy > 0;
//     }
// }

// Particle.prototype.getSignalPull = function () {
//     let force = createVector(0, 0);

//     if (this.cellType === 'ESC' && this.stage === 'Naive' && CARDIO_SIGNAL_SOURCE) {
//         const signalSource = CARDIO_SIGNAL_SOURCE;
//         const distToCardio = p5.Vector.dist(this.position, createVector(signalSource.x, signalSource.y));
//         const signalStrength = exp(-CONSTANTS.SIGNAL_DECAY_FACTOR * distToCardio);

//         force.add(createVector(signalSource.x - this.position.x, signalSource.y - this.position.y));
//         force.normalize();
//         force.mult(signalStrength * 0.01);
//     }

//     return force;
// };

// Particle.prototype.getAlignmentForce = function (allParticles) {
//     let totalForce = createVector(0, 0);

//     if (this.cellType === 'CardioPrecursor') {
//         let neighborSum = createVector(0, 0);
//         let neighborCount = 0;

//         for (let other of allParticles) {
//             if (other !== this && other.cellType === 'CardioPrecursor') {
//                 neighborSum.add(other.position);
//                 neighborCount++;
//             }
//         }

//         if (neighborCount > 0) {
//             let centerOfMass = createVector(neighborSum.x / neighborCount, neighborSum.y / neighborCount);
//             let directionalPull = p5.Vector.sub(centerOfMass, this.position);
//             directionalPull.normalize();
//             directionalPull.mult(0.001);
//             totalForce.add(directionalPull);
//         }
//     }

//     return totalForce;
// };

// Particle.prototype.checkCommitment = function () {
//     if (this.cellType === 'ESC' && this.stage === 'Naive' && CARDIO_SIGNAL_SOURCE) {
//         const signalSource = CARDIO_SIGNAL_SOURCE;
//         const distToCardio = p5.Vector.dist(this.position, createVector(signalSource.x, signalSource.y));

//         if (distToCardio < 100 && this.energy > 30) {
//             this.cellType = 'CardioPrecursor';
//             this.stage = 'Committed';
//             this.energy += 30;
//         }
//     }

//     return this.isAlive();
// };



class Particle {
    constructor(x, y, cellType) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = random(2, 4);
        this.energy = 100;
        this.cellType = cellType;
        this.stage = 'Naive';
        this.committedFrames = 0; // how long this cell has held 'Committed' — drives specialization timing
    }

    update() {
        let totalForce = createVector(0, 0);

        if (this.cellType === 'ESC' && this.stage === 'Naive') {
            // Naive cells sense BOTH niches and get pulled toward whichever
            // signal currently dominates at their position (not hardcoded to cardiac).
            const { source } = getStrongestSignalAt(this.position);
            if (source) {
                totalForce.add(Forces.chemotaxis(this.position, source));
            }
        } else if (this.stage === 'Committed' || this.stage === 'Specialized') {
            // Once committed, cells stop chasing signals and instead cohere
            // with same-type neighbors — this is what builds visible tissue structure.
            totalForce.add(Forces.cohesion(this, particles));
        }

        const wander = p5.Vector.random2D().mult(random(0.1, 0.4));
        totalForce.add(wander);

        this.velocity.add(totalForce);
        this.velocity.mult(0.94);
        this.velocity.limit(3);
        this.position.add(this.velocity);

        if (this.position.x <= 0 || this.position.x >= width) {
            this.velocity.x *= -0.8;
            this.energy -= 0.6;
        }
        if (this.position.y <= 0 || this.position.y >= height) {
            this.velocity.y *= -0.8;
            this.energy -= 0.6;
        }

        this.position.x = constrain(this.position.x, 0, width);
        this.position.y = constrain(this.position.y, 0, height);

        this.energy -= 0.15;
        this.radius = constrain(this.radius + random(-0.002, 0.003), 1.4, 4.5);

        if (this.stage === 'Committed') {
            this.committedFrames++;
        }

        this.checkCommitment();
    }

    checkCollisions(otherParticles) {
        for (let other of otherParticles) {
            if (other === this) continue;
            const dx = other.position.x - this.position.x;
            const dy = other.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (this.cellType === other.cellType && distance < 60) {
                const attractionPull = createVector(dx, dy);
                attractionPull.normalize();
                attractionPull.mult(map(distance, 0, 60, 0.025, 0.001));
                this.velocity.add(attractionPull);
            }
            if (distance < this.radius + other.radius + 2) {
                const push = createVector(this.position.x - other.position.x, this.position.y - other.position.y);
                push.normalize();
                push.mult(map(distance, 0, this.radius + other.radius + 2, 0.03, 0.005));
                this.velocity.add(push);
            }
        }
        this.velocity.limit(2.2);
    }

    isAlive() {
        return this.energy > 0;
    }
}

/**
 * Counts same-type neighbors within radius — a proxy for local tissue density.
 * Used by checkCommitment to decide when a Committed cell has "enough company"
 * to mature into Specialized, independent of how long it's been Committed.
 */
function countSameTypeNeighbors(particle, allParticles, radius) {
    let count = 0;
    for (const other of allParticles) {
        if (other === particle || other.cellType !== particle.cellType) continue;
        if (p5.Vector.dist(particle.position, other.position) < radius) count++;
    }
    return count;
}

Particle.prototype.checkCommitment = function () {
    if (this.cellType === 'ESC' && this.stage === 'Naive') {
        // Compare BOTH niches and commit to whichever is stronger here —
        // this is the missing Endothelial path.
        const { source, concentration } = getStrongestSignalAt(this.position);

        if (source && concentration > CONSTANTS.COMMITMENT_THRESHOLD && this.energy > 30) {
            if (source === CARDIO_SIGNAL_SOURCE) {
                this.cellType = 'CardioPrecursor';
            } else if (source === ENDO_SIGNAL_SOURCE) {
                this.cellType = 'Endothelial';
            }
            this.stage = 'Committed';
            this.committedFrames = 0;
            this.energy += 30;
        }
    } else if (this.stage === 'Committed') {
        // Specialize after sustained time OR enough local same-type density —
        // whichever condition fires first (mirrors time+density-dependent maturation).
        const neighborCount = countSameTypeNeighbors(this, particles, FORCE_DEFAULTS.DETECTION_RADIUS);
        const timeReady = this.committedFrames > CONSTANTS.SPECIALIZATION_FRAMES;
        const clusterReady = neighborCount >= CONSTANTS.SPECIALIZATION_NEIGHBOR_COUNT;

        if (timeReady || clusterReady) {
            this.stage = 'Specialized';
            this.radius = constrain(this.radius + 1.2, 1.4, 6); // visibly larger/more mature
            this.energy += 15;
        }
    }

    return this.isAlive();
};