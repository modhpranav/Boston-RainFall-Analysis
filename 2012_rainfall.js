// Load the data
d3.csv("boston_rainfall_data.csv").then(function (rawData) {
    // Convert numerical values from strings
    rawData.forEach(d => {
        d.year = +d.year;
        d.Inches = +d.Inches;
    });

    rawData = rawData.filter(d => [2012, 2013, 2014].includes(d.year));

    // Populate location dropdown
    const locations = Array.from(new Set(rawData.map(d => d.Location)));
    const locationDropdown = d3.select('#locationDropdown1');
    locations.forEach(location => {
        locationDropdown.append('option').text(location).attr('value', location);
    });

    // Initial chart update
    updateChart2012(rawData, locations[0]);

    // Dropdown change event listener
    locationDropdown.on('change', function () {
        const selectedLocation = d3.select(this).property('value');
        updateChart2012(rawData, selectedLocation);
    });
});

function updateChart2012(rawData, selectedLocation) {
    // Filter data for selected location
    const locationData = rawData.filter(d => d.Location === selectedLocation);

    // Aggregate data by month, summing inches for each year
    const aggregatedData = aggregateData(locationData);
    console.log(aggregatedData);

    // Prepare data for stacking
    const stackKeys = [...new Set(locationData.map(d => `year${d.year}`))];
    const stackedData = d3.stack().keys(stackKeys)(aggregatedData);
    console.log(stackedData);

    // Draw the chart
    drawStackedAreaChart('#chart-2012', stackedData, stackKeys);
}

function aggregateData(data) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const aggregatedData = months.map(month => ({ Month: month }));

    data.forEach(({ year, Month, Inches }) => {
        const entry = aggregatedData.find(d => d.Month === Month);
        entry[`year${year}`] = Inches;
    });

    return aggregatedData;
}

function drawStackedAreaChart(selector, data, keys) {
    const colorPalette = {
        "year2012": "#a6cee3",
        "year2013": "#b2e2e2",
        "year2014": "#66c2a4",
    };

    // Clear previous chart and set up SVG
    const svg = d3.select(selector).html(null),
        margin = { top: 30, right: 30, bottom: 60, left: 60 },
        width = +svg.attr('width') - margin.left - margin.right,
        height = +svg.attr('height') - margin.top - margin.bottom,
        g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand().domain(data[0].map(d => d.data.Month)).range([0, width]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(data, layer => d3.max(layer, d => d[1]))]).range([height, 0]);

    // Area generator
    const area = d3.area()
        .x(d => x(d.data.Month) + x.bandwidth() / 2)
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveMonotoneX); // Smooth the line

    // Draw the areas
    g.selectAll('.layer')
        .data(data)
        .enter().append('path')
        .attr('class', 'layer')
        .attr('d', area)
        .style('fill', d => colorPalette[d.key]);

    // Legend
    const legend = g.selectAll(".legend")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width - 120},${i * 20})`);

    legend.append("rect")
        .attr("x", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorPalette[d]);

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(d => d.replace('year', '')); 

    // Axes
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-45)")
        .style("fill", "#333333"); // Axis text color

    g.append('g')
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("fill", "#333333"); // Axis text color

    // Axis labels
    g.append("text")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 20})`)
        .style("text-anchor", "middle")
        .text("Month")
        .style("fill", "#333333");

    g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Rainfall (inches)")
        .style("fill", "#333333");
}
