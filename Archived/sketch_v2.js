// Global variables to hold our simulated cell clusters
let particles = [];
let CARDIO_SIGNAL_SOURCE = null;
const CANVAS_SIZE = 800; // Placeholder for reference

/**
 * ==============================================================
 * === I. CLASS DEFINITION: Defines the particle (MUST BE FIRST) ==
 * ==============================================================
 */
class Particle {
    constructor(x, y, cellType) {
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.radius = random(2, 4);
        this.energy = 100;
        this.cellType = cellType;         // ESC (Embryonic Stem Cell), CardioPrecursor, Endothelial
        this.stage = 'Naive';             // Naive -> Committed -> Specialized
    }

    update() {
        // Energy slowly drains over time, reflecting the cost of motion and maintenance
        this.energy -= 0.15;

        // 1. Movement Forces (Combination of Wander & Signal)
        let totalForce = createVector(0, 0);

        // A) Random Walk Force: Keeps cells feeling organic
        const wander = p5.Vector.random2D().mult(random(0.1, 0.4));
        totalForce.add(wander);

        // B) Signal Force (Chemotaxis): Guides movement towards a signal source
        let signalPull = this.getSignalPull();
        if (signalPull.mag() > 0) {
            totalForce.add(signalPull);
        }

        // C) Alignment Force: Keeps specialized cells forming linear structures
        let alignmentPull = this.getAlignmentForce(particles);
        totalForce.add(alignmentPull);


        // Apply all net forces to the velocity
        this.velocity.add(totalForce);
        this.velocity.mult(0.94); // Viscous drag force (slows movement over time)
        this.velocity.limit(3);  // Max speed limit

        this.position.add(this.velocity);

        // Boundary Handling: Bounce and energy penalty at walls
        if (this.position.x <= 0 || this.position.x >= width) {
            this.velocity.x *= -0.8; // Damping the bounce to simulate friction
            this.energy -= 0.6;
        }
        if (this.position.y <= 0 || this.position.y >= height) {
            this.velocity.y *= -0.8;
            this.energy -= 0.6;
        }

        // Apply boundary constraint
        this.position.x = constrain(this.position.x, 0, width);
        this.position.y = constrain(this.position.y, 0, height);

        // Energy and Size Modulation: Growth or decay based on state
        this.radius = constrain(this.radius + random(-0.002, 0.003), 1.4, 4.5);


        // Check for differentiation commitment after movement is complete
        this.checkCommitment();
    }

    checkCollisions(otherParticles) {
        for (let other of otherParticles) {
            if (other === this) continue;

            const dx = other.position.x - this.position.x;
            const dy = other.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // 1. INTERACTION: Attraction (Adhesion) and Repulsion (Junctions)
            if (this.cellType === other.cellType && distance < 60) {
                // Attract similar cells to cluster together
                const attractionPull = createVector(dx, dy);
                attractionPull.normalize();
                attractionPull.mult(map(distance, 0, 60, 0.025, 0.001));
                this.velocity.add(attractionPull);
            }

            if (distance < this.radius + other.radius + 2) {
                // Repel when overlapping
                const push = createVector(this.position.x - other.position.x, this.position.y - other.position.y);
                push.normalize();
                push.mult(map(distance, 0, this.radius + other.radius, 0.03, 0.005));
                this.velocity.add(push);
            }
        }

        this.velocity.limit(2.2); // Prevent runaway velocities
    }

    isAlive() {
        return this.energy > 0;
    }
}


/** ==============================================================
 * === II. GLOBAL SIMULATION CONTROL FUNCTIONS (p5.js methods) ==
 * ==============================================================
 */

function setup() {
    // We must define the core logic first, so we defer drawing until p5 is ready.
    createCanvas(windowWidth, windowHeight);
    background(20, 20, 40);
    frameRate(60);

    CARDIO_SIGNAL_SOURCE = createVector(width * 0.5, height * 0.5);

    const initialCount = min(90, max(30, floor(width / 12)));
    for (let i = 0; i < initialCount; i++) {
        // Initial particles are all ESCs
        const x = random(width * 0.2, width * 0.9);
        const y = random(height * 0.2, height * 0.9);
        particles.push(new Particle(x, y, 'ESC'));
    }
    console.log("--- TheStammzelle Simulation Engine Initialized ---");
}

function draw() {
    background(20, 20, 40, 25); // Tracing effect

    let newParticles = [];

    for (let particle of particles) {
        particle.update();
        particle.checkCollisions(particles);

        if (particle.isAlive()) {
            drawParticle(particle);
            newParticles.push(particle);
        }
    }

    // Growth simulation: add new ESCs randomly
    if (newParticles.length < 45 && random() < 0.03) {
        newParticles.push(new Particle(random(width), random(height), 'ESC'));
    }

    particles = newParticles;
}


/**
 * CORE SCIENTIFIC MECHANISMS: These methods are attached to the Particle class prototype.
 */

// --- Differentiation/Fate Tracking ---
Particle.prototype.getSignalPull = function () {
    let force = createVector(0, 0);

    if (this.cellType === 'ESC' && this.stage === 'Naive' && CARDIO_SIGNAL_SOURCE) {
        const signalSource = CARDIO_SIGNAL_SOURCE;
        const distToCardio = p5.Vector.dist(this.position, signalSource);
        // Pull strength drops off with distance (Exponential decay model)
        let signalStrength = exp(-0.001 * distToCardio);
        force.add(createVector(signalSource.x - this.position.x, signalSource.y - this.position.y));
        force.normalize();
        // Apply the calculated strength as a multiplier to the directional pull
        let pullMagnitude = signalStrength * 0.01;
        force.mult(pullMagnitude);

    } else {
        // No specific signals for other types (you can add them later!)
    }
    return force;
};


Particle.prototype.getAlignmentForce = function (allParticles) {
    let totalForce = createVector(0, 0);

    if (this.cellType === 'CardioPrecursor') {
        // This logic simulates forming a sheet or vessel structure:
        // We pull the cell toward the center of mass of its neighbors that share the same type.
        let neighborSum = createVector(0, 0);
        let neighborCount = 0;

        for (let other of allParticles) {
            if (other !== this && other.cellType === 'CardioPrecursor') {
                neighborSum.add(other.position);
                neighborCount++;
            }
        }
        // If we found neighbors, pull toward their average position (center of mass).
        if (neighborCount > 0) {
            let centerOfMass = createVector(neighborSum.x / neighborCount, neighborSum.y / neighborCount);
            let directionalPull = p5.Vector.sub(centerOfMass, this.position);
            directionalPull.normalize(); // Keep the pull uniform in strength
            directionalPull.mult(0.001);
            totalForce.add(directionalPull);
        }
    }
    return totalForce;
};


/** ==============================================================
 * === III. VISUALIZATION & LOGIC UTILITIES (The Glue) =====
 */

function drawParticle(particle) {
    let [hue, saturation] = getCellColor(particle.cellType, particle.stage);
    const alpha = constrain(140 * (particle.energy / 150), 20, 140);
    stroke(hue, saturation, 90, alpha);
    strokeWeight(max(1, particle.radius * 0.9));
    point(particle.position.x, particle.position.y);
}

// --- Differentiation Logic ---
Particle.prototype.checkCommitment = function () {
    let committed = false;

    if (this.cellType === 'ESC' && this.stage === 'Naive' && CARDIO_SIGNAL_SOURCE) {
        // Check distance to the cardiac signal source
        const signalSource = CARDIO_SIGNAL_SOURCE;
        const distToCardio = p5.Vector.dist(this.position, signalSource);

        if (distToCardio < 100 && this.energy > 30) {
            // CONDITION MET: The cell commits to the cardiac lineage!
            this.cellType = 'CardioPrecursor';
            this.stage = 'Committed';
            this.energy += 30;          //30      // Boost energy upon differentiation
            committed = true;
        }
    }

    return this.isAlive(); // Returns the viability status regardless of commitment
}


/**
 * VISUAL MAPPING FUNCTION: Maps biological state to visible color/size (HSB).
 */
function getCellColor(cellType, stage) {
    let hue = 200; // Default ESC blue
    let saturation = 80;

    if (cellType === 'CardioPrecursor') {
        hue = 15;     // Red/Orange Hue for Cardiomyocytes
        saturation = 90;
    } else if (cellType === 'Endothelial') {
        hue = 200;    // Blueish hue for blood vessel lining
        saturation = 70;
    }

    let brightness = map(stage, ['Naive', 'Committed', 'Specialized'], [60, 95, 100]);
    return [hue, saturation];
}
