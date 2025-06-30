// --- Main Application Logic ---
let d3Updater, threeUpdater;

// --- Initialization ---
window.onload = () => {
    radiusSlider.addEventListener('input', handleRadiusChange);
    pointsSlider.addEventListener('input', handlePointsChange);
    
    d3Updater = setupD3Charts();
    threeUpdater = setupThreeJS();
    
    generateData();
    updateVisualizations();
};
