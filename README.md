# TheStammzelle
Stammzelle - Origin of Cell


------------------------------
## TheStammzelle-Visualization: Origin of Cell
An interactive 2D biological particle simulation built with p5.js. This project models the computational mechanics of organogenesis, demonstrating how stem cells transition from unspecialized particles into organized, functional tissues (such as a heart) through local rules and environmental cues.
------------------------------

## Core Biological Principles Simulated
The simulation translates complex embryological phenomena into mathematical forces and state-driven particle behaviors:

## 1. Cell Differentiation (The "What")

* Mechanism: Finite State Machine (FSM) tracking cell identity.
* Logic: Every particle starts as an unspecialized Stem Cell. Based on internal clocks, local cell-to-cell contact, and chemical thresholds, particles permanently differentiate into specialized lineages (e.g., Cardiomyocytes for muscle tissue or Endothelial Cells for blood vessel linings).
* Visuals: Dynamic color rendering, size scaling, and structural configurations specific to the cell state.

## 2. Morphogenesis (The "How Structures Form")

* Mechanism: Dynamic shape alignment and structural constraints.
* Logic: Cells are prevented from collapsing into a chaotic, formless blob. They leverage local steering behaviors to self-organise into complex structural geometries such as cellular sheets, tubular vessels, and spiral muscular walls.
* Forces: Implements physical boundaries, strict structural spacing, and cohesive group clustering.

## 3. Gradient Signaling (The "Where to Go")

* Mechanism: Chemotaxis and Chemokinesis vector fields.
* Logic: Cells lack global awareness. Instead, they sample the localized intensity of chemical signaling molecules (morphogens/hormones) emitted by biological niches. Cells calculate spatial gradients and alter their velocity vectors to migrate up or down concentration fields.

------------------------------
##  Architecture & File Map
The repository is modularised into highly focused files following clean software design patterns:

TheStammzelle-Visualization/
├── index.html            # Main page loader and p5.js context injector
├── README.md             # Project documentation, rules, and architecture map
├── .gitignore            # Version control exclusions
└── js/
    ├── Constants.js      # Global physics constants, chemical bounds, and state definitions
    ├── sketch.js         # Central engine running the p5.js setup() and draw() loops
    ├── Particle.js       # The Class object containing cell attributes, clocks, and FSM states
    ├── Forces.js         # Vector math for biological attraction, repulsion, and chemokinesis
    └── SignalSources.js  # Fixed coordinate origins acting as hormone pumps/niche zones

## Module Breakdown

* Constants.js
Defines strict boundaries to prevent magic numbers. Holds variables like DETECTION_RADIUS, DESIRED_SEPARATION, MUTATION_RATE, and cellular state enums (STEM, CARDIOMYOCYTE, ENDOTHELIAL).
* sketch.js
Initialises the canvas, populates the particle arrays, spawns signal sources, and serves as the frame-by-frame orchestrator calling updates across modules.
* Particle.js
Tracks individual entity logic: coordinates, current velocity, physical mass, age, differentiation path, and individual sensor ranges.
* Forces.js
The mathematical engine. Calculates steering vectors using classic physics algorithms overlaid with biological rules (e.g., standard inverse-square law degradation for concentration fields).
* SignalSources.js
Renders stationary biological triggers that emit continuous scalar fields across the digital canvas, simulating static organs or structural anchor points.

------------------------------
##  Getting Started## Prerequisites
To run the visualization locally, you only need a modern web browser. The system references the p5.js framework via a CDN link within the HTML setup.
## Running the Project

   1. Clone the repository:
   
   git clone https://github.com/htra0055/TheStammzelle.git
   
   2. Navigate into the directory:
   
   cd TheStammzelle-Visualization
   
   3. Launch a local server:
   Because p5.js sketches occasionally encounter CORS limitations when loading external resources locally, it is best to run it through a local HTTP server.
   * If using VS Code: Install the Live Server extension, right-click index.html, and select Open with Live Server.
      * If using Python: Run the command below in your terminal and visit http://localhost:8000:
      
      python3 -m http.server 8000
      
      
------------------------------
##  Modifying the Parameters
To adjust how the tissue forms, open js/Constants.js to tweak the core mechanics:

* Change Cellular Packing Density: Alter DESIRED_SEPARATION to force tight tissue structures or loose, fluid cell clusters.
* Speed Up Differentiation: Lower the threshold value for chemical concentration triggers to force stem cells to differentiate much closer to the signal sources.
* Vary Movement Aggression: Tweak the force multipliers in Forces.js to experiment with aggressive cell scattering vs. slow, highly controlled alignment.

