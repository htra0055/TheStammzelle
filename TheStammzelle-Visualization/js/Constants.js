// js/Constants.js: Stores fixed values used by the simulation.

const CARDIO_SIGNAL_SOURCE = { x: 0.65, y: 0.35 };
const ENDO_SIGNAL_SOURCE = { x: 0.2, y: 0.7 };

const CELL_TYPES = {
    ESC: 'ESC',
    CARDIO: 'CardioPrecursor',
    ENDOTHELIAL: 'Endothelial'
};

const COLOR_MAP = {
    ESC: { hue: 200, saturation: 80 },
    CARDIO: { hue: 15, saturation: 90 },
    ENDOTHELIAL: { hue: 200, saturation: 70 }
};

const CONSTANTS = {
    MAX_ENERGY: 150,
    SIGNAL_DECAY_FACTOR: 0.001,
    COMMITMENT_THRESHOLD: 0.08,       // concentration a Naive ESC needs to feel to commit
    SPECIALIZATION_FRAMES: 240,       // ~4s at 60fps of being Committed
    SPECIALIZATION_NEIGHBOR_COUNT: 5  // same-type neighbors that fast-track specialization
};


