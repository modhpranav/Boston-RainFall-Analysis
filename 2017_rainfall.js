function createBubbleTimeChart(chartId, data) {
    d3.select(chartId).selectAll('*').remove(); // Clear the chart for redraw
    const svg = d3.select(chartId),
        margin = { top: 20, right: 20, bottom: 60, left: 60 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

    const tooltip = d3.select("#tooltip");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%B");
    data.forEach(d => {
        d.date = parseDate(d.Month);
    });

    const x = d3.scaleBand().domain(data.map(d => d.date)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.Inches)]).range([height, 0]);
    const z = d3.scaleSqrt().domain([0, d3.max(data, d => d.Inches)]).range([2, 20]); // Bubble size

    // X-axis
    g.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%B")))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-65)"); // Rotate for spacing

    // Y-axis
    g.append("g").call(d3.axisLeft(y));

    // Axes labels
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 50)
        .text("Month");

    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", margin.left / 4)
        .attr("x", -(height / 2 + margin.top))
        .text("Rainfall (inches)");

    g.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => x(d.date) + x.bandwidth() / 2)
        .attr("cy", d => y(d.Inches))
        .attr("r", d => z(d.Inches))
        .style("fill", d => d.year === 2017 ? "#69b3a2" : "#404080")
        .style("opacity", "0.7")
        .on("mouseover", function (event, d) {
            // Calculate offsets
            const svgRect = svg.node().getBoundingClientRect(); // Get the bounding rectangle of the SVG
            const offsetX = svgRect.left + window.scrollX; // Add window's scroll to handle scrolling
            const offsetY = svgRect.top + window.scrollY;
        
            // Adjusted tooltip positions
            let left = event.pageX - offsetX; // Adjust based on SVG's offset
            let top = event.pageY - offsetY;
        
            tooltip.html(`Time: ${d.Month} ${d.year}<br>Rainfall: ${d.Inches} inches`)
                .style("visibility", "visible")
                .style("opacity", 1)
                // .style("left", `${left}px`)
                // .style("top", `${top}px`);
        })
        .on("mouseout", function () {
            tooltip.style("visibility", "hidden")
            .style("opacity", 0); // Make tooltip fully transparent
        });

}

function updateChart2017(data, location) {
    var data2017 = data.filter(d => d.Location === location);
    createBubbleTimeChart('#chart-2017', data2017, 'Month', 'Rainfall (inches)');
}

// Load the data
d3.csv("boston_rainfall_data.csv").then(function (rawData) {
    // Convert numerical values from strings
    rawData.forEach(d => {
        d.year = +d.year;
        d.Inches = +d.Inches;
    });

    rawData = rawData.filter(d => [2017, 2018].includes(d.year));

    // Populate location dropdown
    const locations = Array.from(new Set(rawData.map(d => d.Location)));
    dropdown2017 = d3.select('#locationDropdown3')
    locations.forEach(location => {
        dropdown2017.append('option').text(location).attr('value', location);
    });
    // Initial chart update
    updateChart2017(rawData, locations[0]);

    // Dropdown change event listener
    dropdown2017.on('change', function () {
        const selectedLocation = d3.select(this).property('value');
        updateChart2017(rawData, selectedLocation);
    });
});