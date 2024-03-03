function createMonthChart(chartId, data, xLabel, yLabel) {
    const svg = d3.select(chartId);
    svg.selectAll('*').remove(); // Clear previous chart

    const margin = { top: 30, right: 30, bottom: 60, left: 60 },
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Standardized color scheme
    const colors = {
        lineFill: "#4073FF",
        axisText: "#333333",
        dotFill: "#FF5733",
        tooltipBackground: "rgba(255, 255, 255, 0.9)",
        tooltipBorder: "1px solid #ddd"
    };

    const x = d3.scaleBand().domain(data.map(d => d.Month)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.Inches) + 3]).range([height, 0]);

    // Tooltip setup
    // Tooltip setup
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background-color", colors.tooltipBackground)
        .style("border", colors.tooltipBorder)
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("visibility", "hidden")
        .style("pointer-events", "none");

    // Axes with consistent styling
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d => d))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("fill", colors.axisText);

    g.append('g')
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", colors.axisText);

    // Axis labels with consistent styling
    g.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
        .style("text-anchor", "middle")
        .text(xLabel)
        .style("fill", colors.axisText);

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yLabel)
        .style("fill", colors.axisText);

    // Line chart with consistent coloring
    const line = d3.line().x(d => x(d.Month) + x.bandwidth() / 2).y(d => y(d.Inches));
    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', colors.lineFill)
        .attr('stroke-width', 2)
        .attr('d', line);

    // Circles for each data point with tooltips
    g.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.Month) + x.bandwidth() / 2)
        .attr("cy", d => y(d.Inches))
        .attr("r", 5)
        .attr("fill", colors.dotFill)
        .on("mouseover", (event, d) => {
            tooltip.html(`Rainfall: ${d.Inches} inches`)
                .style("visibility", "visible");
        })
        .on("mousemove", (event) => {
            tooltip.style("top", `${event.pageY - 10}px`)
                .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", () => {
            tooltip.style("visibility", "hidden");
        });
}


function updateChart2011(data, location) {
    var data2011 = data.filter(d => d.Location === location);
    createMonthChart('#chart-2011', data2011, 'Month', 'Rainfall (inches)');
}

// Load the data
d3.csv("boston_rainfall_data.csv").then(function (rawData) {
    // Convert numerical values from strings
    rawData.forEach(d => {
        d.year = +d.year;
        d.Inches = +d.Inches;
    });

    rawData = rawData.filter(d => [2011].includes(d.year));

    // Populate location dropdown
    const locations = Array.from(new Set(rawData.map(d => d.Location)));
    dropdown2011 = d3.select('#locationDropdown')
    locations.forEach(location => {
        dropdown2011.append('option').text(location).attr('value', location);
    });
    // Initial chart update
    updateChart2011(rawData, locations[0]);

    // Dropdown change event listener
    dropdown2011.on('change', function () {
        const selectedLocation = d3.select(this).property('value');
        updateChart2011(rawData, selectedLocation);
    });
});