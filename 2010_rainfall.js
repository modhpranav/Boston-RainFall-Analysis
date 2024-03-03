// Standardized chart dimensions and margins
const margin = { top: 30, right: 30, bottom: 200, left: 60 },
      width = 600 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Standardized color scheme
const colors = {
  barFill: "orange", // Example bar color
  axisText: "#333333", // Axis text color
  tooltipBackground: "rgba(255, 255, 255, 0.9)", // Tooltip background color
  tooltipBorder: "1px solid #ddd" // Tooltip border
};

// Creating the SVG container
const svg = d3.select("#chart-2010").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip setup
const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background-color", colors.tooltipBackground)
    .style("border", colors.tooltipBorder)
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("visibility", "hidden")
    .style("pointer-events", "none");

// Scales setup
const x = d3.scaleBand().range([0, width]).padding(0.1);
const y = d3.scaleLinear().range([height, 0]);

// Load and process data
d3.csv("boston_rainfall_data.csv").then(function(data) {
  // Data processing for 2010
  data.forEach(d => {
    d.year = +d.year;
    d.Inches = +d.Inches;
  });
  const data2010 = data.filter(d => d.year === 2010);

  // Scale domains
  x.domain(data2010.map(d => d.Location));
  y.domain([0, d3.max(data2010, d => d.Inches)+1]);

  // Bar chart
  svg.selectAll(".bar")
      .data(data2010)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.Location))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d.Inches))
      .attr("height", d => height - y(d.Inches))
      .attr("fill", colors.barFill)
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

  // Axes
  svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)")
      .style("fill", colors.axisText);

  svg.append("g").call(d3.axisLeft(y))
    .selectAll("text")
      .style("fill", colors.axisText);

  // Axis labels
  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 15)
      .text("Location")
      .style("fill", colors.axisText);

  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .text("Rainfall (inches)")
      .style("fill", colors.axisText);
});
