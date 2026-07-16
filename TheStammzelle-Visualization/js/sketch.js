// js/sketch.js: Main simulation loop and front-end interaction layer.
// NEXT STEP: Add richer UI controls for signal strength, particle count, and lineage state.

let particles = [];
let hoveredParticle = null;
let isPaused = false;
let draggedSignalSource = null;

/**
 * SETUP: Runs ONLY ONCE when the page loads. Use this for initialization.
 */
function setup() {
    createCanvas(windowWidth, windowHeight);

    /*
    Canvas view: consistent dark navy start; set HSB mode BEFORE using it
    */
    colorMode(HSB, 360, 100, 100, 255);
    background(220, 40, 12);
    frameRate(60);

    // We wait until the window is ready before calculating coordinates:
    setTimeout(() => {
        CARDIO_SIGNAL_SOURCE.x = width * 0.65;
        CARDIO_SIGNAL_SOURCE.y = height * 0.35;
        ENDO_SIGNAL_SOURCE.x = width * 0.2;
        ENDO_SIGNAL_SOURCE.y = height * 0.7;
    }, 10); // Delaying the calculation by a tiny amount increases stability

    const initialCount = min(90, max(30, floor(width / 12)));
    for (let i = 0; i < initialCount; i++) {
        particles.push(new Particle(random(width), random(height), 'ESC'));
    }

    const pauseButton = document.getElementById('pauseButton');
    const resetButton = document.getElementById('resetButton');
    const clearButton = document.getElementById('clearButton');
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }
    if (resetButton) {
        resetButton.addEventListener('click', resetSimulation);
    }
    if (clearButton) {
        clearButton.addEventListener('click', clearTrails);
    }

    console.log("--- TheStammzelle Simulation Engine Initialized ---");
}



/**
 * VISUAL MAPPING FUNCTION: Maps biological state to visible color/size (HSB).
 */

function getCellColor(cellType, stage) {
    let hue = 200;
    let saturation = 80;

    if (cellType === 'CardioPrecursor') {
        hue = 15;
        saturation = 90;
    } else if (cellType === 'Endothelial') {
        hue = 200;
        saturation = 70;
    }

    let brightness;
    switch (stage) {
        case 'Naive': brightness = 60; break;
        case 'Committed': brightness = 95; break;
        case 'Specialized': brightness = 100; break;
        default: brightness = 60;
    }

    return [hue, saturation, brightness];
}

/**
 * DRAW: Runs repeatedly (e.g., 60 times per second). This is the simulation loop.
 */
function draw() {
    background(220, 40, 12, 20);

    renderAllSignalSources(); // draw niche glows BEFORE particles so cells render on top

    hoveredParticle = null;
    let newParticles = [];

    // ---  THE CORE PHYSICS LOOP STARTS HERE ---
    for (let particle of particles) {
        const distanceToMouse = dist(mouseX, mouseY, particle.position.x, particle.position.y);
        if (distanceToMouse < 14) {
            hoveredParticle = particle;
        }

        if (!isPaused) {
            particle.update();
            particle.checkCollisions(particles);
        }

        if (particle.isAlive()) {
            drawParticle(particle, hoveredParticle === particle);
            newParticles.push(particle);
        }
    }

    if (!isPaused && random() < 0.03 && newParticles.length < 100) {
        newParticles.push(new Particle(random(width), random(height), 'ESC'));
    }

    particles = newParticles;
}

function drawParticle(particle, isHovered = false) {
    let [hue, saturation, brightness] = getCellColor(particle.cellType, particle.stage);
    const alpha = constrain(140 * (particle.energy / CONSTANTS.MAX_ENERGY), 20, 140);

    if (isHovered) {
        noFill();
        stroke(0, 0, 100, 120);
        strokeWeight(1.2);
        ellipse(particle.position.x, particle.position.y, particle.radius * 6, particle.radius * 6);
    }

    stroke(hue, saturation, brightness, alpha);
    strokeWeight(max(1, particle.radius * 0.9));
    point(particle.position.x, particle.position.y);
}

function togglePause() {
    isPaused = !isPaused;
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    }
}

function resetSimulation() {
    particles = [];
    const initialCount = min(90, max(30, floor(width / 12)));
    for (let i = 0; i < initialCount; i++) {
        particles.push(new Particle(random(width), random(height), 'ESC'));
    }
    hoveredParticle = null;
    isPaused = false;
    const pauseButton = document.getElementById('pauseButton');
    if (pauseButton) {
        pauseButton.textContent = 'Pause';
    }
}

function clearTrails() {
    particles = [];
    hoveredParticle = null;
    background(220, 40, 12);
    renderAllSignalSources();
}

function cycleCellType(currentType) {
    const types = ['ESC', 'CardioPrecursor', 'Endothelial'];
    const currentIndex = types.indexOf(currentType);
    const nextIndex = (currentIndex + 1) % types.length;
    return types[nextIndex];
}

function mousePressed() {
    for (const source of SIGNAL_SOURCES) {
        const distanceToMouse = dist(mouseX, mouseY, source.x, source.y);
        if (distanceToMouse < source.radius * 0.35) {
            draggedSignalSource = source;
            return;
        }
    }

    let clickedParticle = null;

    for (let particle of particles) {
        const distanceToMouse = dist(mouseX, mouseY, particle.position.x, particle.position.y);
        if (distanceToMouse < 14) {
            clickedParticle = particle;
            break;
        }
    }

    if (clickedParticle) {
        clickedParticle.cellType = cycleCellType(clickedParticle.cellType);
        clickedParticle.stage = 'Naive';
        clickedParticle.energy = 100;
        clickedParticle.radius = 3;
    } else {
        particles.push(new Particle(mouseX, mouseY, 'ESC'));
    }
}

function mouseDragged() {
    if (draggedSignalSource) {
        draggedSignalSource.x = mouseX;
        draggedSignalSource.y = mouseY;
    }
}

function mouseReleased() {
    draggedSignalSource = null;
}

