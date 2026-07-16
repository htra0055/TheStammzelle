// js/sketch.js: The main loop that runs everything.

let particles = [];


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

    // Fixed: map() was being called with array args (invalid p5 signature),
    // so brightness was computed then silently dropped. Now it's a real
    // stage → brightness lookup, and it's actually returned/used.
    let brightness;
    switch (stage) {
        case 'Naive': brightness = 60; break;
        case 'Committed': brightness = 95; break;
        case 'Specialized': brightness = 100; break;
        default: brightness = 60;
    }

    return [hue, saturation, brightness];
}


function draw() {
    background(220, 40, 12, 20);

    renderAllSignalSources(); // draw niche glows BEFORE particles so cells render on top

    let newParticles = [];

    for (let particle of particles) {
        particle.update();
        particle.checkCollisions(particles);

        if (particle.isAlive()) {
            drawParticle(particle);
            newParticles.push(particle);
        }
    }

    if (random() < 0.03 && newParticles.length < 100) {
        newParticles.push(new Particle(random(width), random(height), 'ESC'));
    }

    particles = newParticles;
}

function drawParticle(particle) {
    let [hue, saturation, brightness] = getCellColor(particle.cellType, particle.stage);
    const alpha = constrain(140 * (particle.energy / CONSTANTS.MAX_ENERGY), 20, 140);

    stroke(hue, saturation, brightness, alpha);
    strokeWeight(max(1, particle.radius * 0.9));
    point(particle.position.x, particle.position.y);
}

