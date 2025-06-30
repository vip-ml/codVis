// --- Configuration & State ---
let numPoints = 2000;
let radius = 1.0;
const MAX_DIMS = 20;
let data = [];

// --- DOM Elements ---
const radiusSlider = document.getElementById('radius-slider');
const pointsSlider = document.getElementById('points-slider');
const radiusValue = document.getElementById('radius-value');
const pointsValue = document.getElementById('points-value');

// --- Utility Functions ---
// Uses the Box-Muller transform to generate a pair of standard normal random variables.
function gaussianRandom() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

// Generate a sample from multivariate normal distribution with identity covariance
function generateMultivariateNormal(dimensions) {
    const sample = [];
    for (let i = 0; i < dimensions; i++) {
        sample.push(gaussianRandom());
    }
    return sample;
}

// Generates multi-dimensional data points from proper multivariate normal distributions.
function generateData() {
    data = [];
    for (let i = 0; i < numPoints; i++) {
        // Generate a full MAX_DIMS dimensional sample
        const fullSample = generateMultivariateNormal(MAX_DIMS);
        data.push(fullSample);
    }
}

function calculateAndDisplayPercentages() {
    const radiusSq = radius * radius;
    let counts = Array(MAX_DIMS + 1).fill(0);

    data.forEach(point => {
        let distSq = 0;
        for (let d = 0; d < MAX_DIMS; d++) {
            distSq += point[d] * point[d];
            if (distSq <= radiusSq) {
                counts[d + 1]++;
            }
        }
    });
    
    const formatPercent = (n) => ((n / numPoints) * 100).toFixed(2) + '%';
    document.getElementById('p1d').textContent = formatPercent(counts[1]);
    document.getElementById('p2d').textContent = formatPercent(counts[2]);
    document.getElementById('p3d').textContent = formatPercent(counts[3]);
    document.getElementById('p4d').textContent = formatPercent(counts[4]);
    document.getElementById('p5d').textContent = formatPercent(counts[5]);
    document.getElementById('p10d').textContent = formatPercent(counts[10]);
    document.getElementById('p20d').textContent = formatPercent(counts[20]);
}

function updateVisualizations() {
    if (!data.length || !d3Updater || !threeUpdater) return;
    calculateAndDisplayPercentages();
    d3Updater(radius);
    threeUpdater(radius);
}

function handleRadiusChange(e) {
    radius = parseFloat(e.target.value);
    radiusValue.textContent = radius.toFixed(2);
    updateVisualizations();
}

function handlePointsChange(e) {
    numPoints = parseInt(e.target.value);
    pointsValue.textContent = numPoints;
    generateData();
    updateVisualizations();
}
