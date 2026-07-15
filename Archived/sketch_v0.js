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

    // Initialize a small group of starting particles
    for (let i = 0; i < 10; i++) {
        particles.push(new Particle(random(width), random(height)));
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
            stroke(255, 100, 100, 150); // Semi-transparent color
            point(particle.x, particle.y);
            newParticles.push(particle);
        } else {
            // Optional: If the particle dies or its energy is spent, it's removed from the list.
        }
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
        // -----------------
        // === THIS IS WHERE YOU WILL ADD ALL THE RULES: ===
        // 1. APPLY FORCES (Attraction, Repulsion, Random Walk)
        // 2. UPDATE POSITION BASED ON CALCULATED NET FORCE
        // 3. DECAY ENERGY AND CHECK LIFE CYCLE
        // -----------------

        this.position.add(this.velocity); // Simple placeholder movement for now
    }

    checkCollisions(otherParticles) {
        // Logic to check distance between this particle and others (e.g., if they touch, repel or bond)
    }

    isAlive() {
        return this.energy > 0; // Returns true if the cell/molecule is viable
    }
}

// The simulation logic will continue here...
