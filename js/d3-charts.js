// --- D3 Visualization Setup ---
function setupD3Charts() {
    // Common setup
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    
    // --- 1D Histogram ---
    const histContainer = d3.select("#d3-1d-chart");
    let histWidth, histHeight;
    const histSvg = histContainer.append("svg").attr("width", "100%").attr("height", "100%");
    const histG = histSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const histX = d3.scaleLinear();
    const histY = d3.scaleLinear();
    const xAxisG = histG.append("g").attr("class", "axis axis--x");
    
    // --- 2D Scatter Plot ---
    const scatterContainer = d3.select("#d3-2d-chart");
    let scatterWidth, scatterHeight;
    const scatterSvg = scatterContainer.append("svg").attr("width", "100%").attr("height", "100%");
    const scatterG = scatterSvg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    const scatterX = d3.scaleLinear().domain([-4, 4]);
    const scatterY = d3.scaleLinear().domain([-4, 4]);
    const scatterXAxisG = scatterG.append("g").attr("class", "axis axis--x");
    const scatterYAxisG = scatterG.append("g").attr("class", "axis axis--y");
    const scatterClipPath = scatterG.append("defs").append("clipPath").attr("id", "scatter-clip").append("rect");
    const scatterPointsG = scatterG.append("g").attr("clip-path", "url(#scatter-clip)");
    let selectionCircle;

    // --- Resize Observer ---
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target.id === 'd3-1d-chart') {
                histWidth = entry.contentRect.width - margin.left - margin.right;
                histHeight = entry.contentRect.height - margin.top - margin.bottom;
                histSvg.attr("viewBox", `0 0 ${entry.contentRect.width} ${entry.contentRect.height}`);
                histX.range([0, histWidth]);
                histY.range([histHeight, 0]);
                xAxisG.attr("transform", `translate(0,${histHeight})`);
            } else if (entry.target.id === 'd3-2d-chart') {
                scatterWidth = entry.contentRect.width - margin.left - margin.right;
                scatterHeight = entry.contentRect.height - margin.top - margin.bottom;
                scatterSvg.attr("viewBox", `0 0 ${entry.contentRect.width} ${entry.contentRect.height}`);
                scatterX.range([0, scatterWidth]);
                scatterY.range([scatterHeight, 0]);
                scatterXAxisG.attr("transform", `translate(0,${scatterHeight})`);
                scatterClipPath.attr("width", scatterWidth).attr("height", scatterHeight);
            }
        }
        updateVisualizations(); 
    });

    resizeObserver.observe(document.getElementById('d3-1d-chart'));
    resizeObserver.observe(document.getElementById('d3-2d-chart'));

    return (radius) => {
        // --- Update 1D Histogram ---
        const xValues = data.map(d => d[0]);
        histX.domain(d3.extent(xValues)).nice();
        const bins = d3.bin().domain(histX.domain()).thresholds(40)(xValues);
        histY.domain([0, d3.max(bins, d => d.length)]).nice();

        histG.selectAll(".bar").remove();
        histG.selectAll(".bar")
            .data(bins)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => histX(d.x0) + 1)
            .attr("width", d => Math.max(0, histX(d.x1) - histX(d.x0) - 1))
            .attr("y", d => histY(d.length))
            .attr("height", d => histHeight - histY(d.length))
            .classed("highlighted", d => d.x0 <= radius && d.x1 >= -radius);

        xAxisG.call(d3.axisBottom(histX));

        // --- Update 2D Scatter Plot ---
        scatterXAxisG.call(d3.axisBottom(scatterX));
        scatterYAxisG.call(d3.axisLeft(scatterY));
        
        const points = scatterPointsG.selectAll("circle").data(data);
        points.enter().append("circle")
            .attr("r", 2.5)
            .attr("opacity", 0.6)
            .merge(points)
            .attr("cx", d => scatterX(d[0]))
            .attr("cy", d => scatterY(d[1]))
            .attr("fill", d => {
                const distanceSquared = d[0] * d[0] + d[1] * d[1];
                const radiusSquared = radius * radius;
                return distanceSquared <= radiusSquared ? '#3b82f6' : '#9ca3af';
            });
        points.exit().remove();
        
        if (!selectionCircle) {
            selectionCircle = scatterG.append("circle")
                .attr("fill", "none")
                .attr("stroke", "#1d4ed8")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "4 4");
        }
        selectionCircle
            .attr("cx", scatterX(0))
            .attr("cy", scatterY(0))
            .attr("r", (scatterX(radius) - scatterX(0)));
    };
}
