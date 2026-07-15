// Global variables to hold our simulated cell clusters
let particles = [];
const CANVAS_SIZE = 800; // Define a standard initial size for easy debugging

/**
 * SETUP: Runs ONLY ONCE when the page loads. Use this for initialization.
 */
function setup() {
    // Create the canvas element and set its dimensions
    createCanvas(windowWidth, windowHeight);
    background(20, 20, 40); // Dark blue/purple background representing the cellular environment
    frameRate(60);

    // Initialize a richer starting population to resemble an early cellular environment
    const initialCount = min(90, max(30, floor(width / 12)));
    for (let i = 0; i < initialCount; i++) {
        const x = random(width * 0.1, width * 0.9);
        const y = random(height * 0.1, height * 0.9);
        particles.push(new Particle(x, y));
    }
    console.log("TheStammzelle Simulation Engine Initialized.");
}

/**
 * DRAW: Runs repeatedly (e.g., 60 times per second). This is the simulation loop.
 */
function draw() {
    // Optional: Instead of clearing completely, drawing a translucent background creates 'trails'
    background(20, 20, 40, 25);

    let newParticles = [];

    // ---  THE CORE PHYSICS LOOP STARTS HERE ---
    for (let particle of particles) {
        particle.update(); // Updates position based on forces and time
        particle.checkCollisions(particles); // Checks interaction with other cells/molecules

        if (particle.isAlive()) {
            // Draw the particle using its current calculated position
            stroke(255, 120, 90, 140); // Semi-transparent color
            strokeWeight(max(1, particle.radius * 0.9));
            point(particle.position.x, particle.position.y);
            newParticles.push(particle);
        }
    }

    // Add occasional new particles to simulate growth and environmental activity
    if (newParticles.length < 45 && random() < 0.04) {
        newParticles.push(new Particle(random(width), random(height)));
    }

    particles = newParticles; // Update the main array with surviving particles
    // --- 🧪 THE CORE PHYSICS LOOP ENDS HERE ---
}


/**
 * CLASS DEFINITION: Defines what a single 'molecule' or 'cell cluster' looks like.
 */
class Particle {
    constructor(x, y) {
        this.position = createVector(x, y); // Position (x, y) on the screen
        this.velocity = createVector(0, 0); // How fast and where it moves
        this.radius = random(2, 4);       // Size of the pixel/molecule
        this.energy = 100;                 // Determines lifespan or growth potential
    }

    update() {
        // Energy slowly drains over time, reflecting the cost of motion and maintenance
        this.energy -= 0.18;

        // Introduce a small random walk so the cells feel alive and organic
        const wander = p5.Vector.random2D().mult(random(0.15, 0.6));
        const centerPull = createVector(width * 0.5, height * 0.5);
        centerPull.sub(this.position);
        centerPull.mult(0.0005);

        this.velocity.add(wander);
        this.velocity.add(centerPull);
        this.velocity.mult(0.94);
        this.velocity.limit(2.2);

        this.position.add(this.velocity);

        // Boundary handling: keep the cells inside the environment and add a bit of friction
        if (this.position.x <= 0 || this.position.x >= width) {
            this.velocity.x *= -1;
            this.energy -= 0.6;
        }
        if (this.position.y <= 0 || this.position.y >= height) {
            this.velocity.y *= -1;
            this.energy -= 0.6;
        }

        this.position.x = constrain(this.position.x, 0, width);
        this.position.y = constrain(this.position.y, 0, height);

        // Slightly vary the size based on energy, mimicking growth or decay
        this.radius = constrain(this.radius + random(-0.002, 0.003), 1.4, 4.5);
    }

    checkCollisions(otherParticles) {
        // Cells feel attraction at a distance, but repel when they get too close
        for (let other of otherParticles) {
            if (other === this) continue;

            const dx = other.position.x - this.position.x;
            const dy = other.position.y - this.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const interactionDistance = 70;
            const collisionDistance = this.radius + other.radius + 2;

            if (distance < interactionDistance) {
                const pull = createVector(dx, dy);
                pull.normalize();
                pull.mult(map(distance, 0, interactionDistance, 0.025, 0.001));
                this.velocity.add(pull);
            }

            if (distance < collisionDistance) {
                const push = createVector(this.position.x - other.position.x, this.position.y - other.position.y);
                push.normalize();
                push.mult(map(distance, 0, collisionDistance, 0.03, 0.005));
                this.velocity.add(push);
                this.energy -= 0.08;
                other.energy -= 0.03;
            }
        }

        this.velocity.limit(2.2);
    }

    isAlive() {
        return this.energy > 0; // Returns true if the cell/molecule is viable
    }
}

// The simulation logic will continue here...
