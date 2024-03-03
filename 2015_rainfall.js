function createChart2015(chartId, data, xLabel, yLabel) {
    const svg = d3.select(chartId);
    svg.selectAll('*').remove(); // Clear the chart for redraw

    const margin = { top: 10, right: 30, bottom: 50, left: 60 },
          width = +svg.attr('width') - margin.left - margin.right,
          height = +svg.attr('height') - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.Inches) + 3]).range([height, 0]);

    // Axes
    g.append('g').attr('transform', `translate(0,${height})`).call(d3.axisBottom(x)).selectAll("text")
        .attr("transform", "rotate(-45)").style("text-anchor", "end").style("fill", "black");
    g.append('g').call(d3.axisLeft(y)).selectAll("text").style("fill", "black");

    // Axis labels
    g.append("text").attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`).style("text-anchor", "middle").text(xLabel).style("fill", "black");
    g.append("text").attr("transform", "rotate(-90)").attr("y", 0 - margin.left).attr("x", 0 - (height / 2)).attr("dy", "1em").style("text-anchor", "middle").text(yLabel).style("fill", "black");

    // Define colors for the lines
    const colorScheme = {
        "2015": "#4daf4a",
        "2016": "#377eb8",
    };

    // Draw lines for each year
    const years = Array.from(new Set(data.map(d => d.year)));
    years.forEach(year => {
        const yearData = data.filter(d => d.year === year);
        const line = d3.line().x(d => x(d.Month)).y(d => y(d.Inches));
        g.append('path').datum(yearData).attr('fill', 'none').attr('stroke', colorScheme[year]).attr('stroke-width', 1.5).attr('d', line);
    });

    // Legend
    const legend = svg.append("g")
        // .attr("font-family", "sans-serif")
        // .attr("font-size", 10)
        // .attr("text-anchor", "end")
        .selectAll("g")
        .data(years)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(-50,${i * 20 + 20})`);

    legend.append("rect")
        .attr("x", width - 50)
        .attr("width", 18)
        .attr("height", 18)
        .style("text-anchor", "end")
        .attr("fill", d => colorScheme[d]);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d);

    // Tooltip for displaying exact values on hover
    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")
        .style("visibility", "hidden");
    
    // Circles for each data point
    g.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.Month) + x.bandwidth() / 2)
        .attr("cy", d => y(d.Inches))
        .attr("r", 5)
        .attr("fill", function(d) {
            return d.year === 2016 ? "steelblue" : "darkgreen";
        })
        .on("mouseover", function(event, d) {
            tooltip.html(`Rainfall: ${d.Inches} inches`).style("visibility", "visible");
        })
        .on("mousemove", function(event) {
            tooltip.style("top", (event.pageY - 10) + "px").style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });

}

function updateChart2015(data, location) {
    var data2015 = data.filter(d => d.Location === location);
    createChart2015('#chart-2015', data2015, 'Month', 'Rainfall (inches)');
}

// Load the data
d3.csv("boston_rainfall_data.csv").then(function (rawData) {
    // Convert numerical values from strings
    rawData.forEach(d => {
        d.year = +d.year;
        d.Inches = +d.Inches;
    });

    rawData = rawData.filter(d => [2015, 2016].includes(d.year));

    // Populate location dropdown
    const locations = Array.from(new Set(rawData.map(d => d.Location)));
    dropdown2015 = d3.select('#locationDropdown2')
    locations.forEach(location => {
        dropdown2015.append('option').text(location).attr('value', location);
    });
    // Initial chart update
    updateChart2015(rawData, locations[0]);

    // Dropdown change event listener
    dropdown2015.on('change', function () {
        const selectedLocation = d3.select(this).property('value');
        updateChart2015(rawData, selectedLocation);
    });
});