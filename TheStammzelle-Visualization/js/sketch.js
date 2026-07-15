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



function draw() {
    // HSB: hue 220° (blue-navy), low saturation, but real brightness (12%) so trails don't vanish
    background(220, 40, 12, 20);

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
    let [hue, saturation] = getCellColor(particle.cellType, particle.stage);
    const alpha = constrain(140 * (particle.energy / CONSTANTS.MAX_ENERGY), 20, 140);

    stroke(hue, saturation, 90, alpha);
    strokeWeight(max(1, particle.radius * 0.9));
    point(particle.position.x, particle.position.y);
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
