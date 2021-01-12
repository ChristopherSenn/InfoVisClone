var w = 50, h = 300;

var key = d3.select("#heatmap-legend")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

var legend = key.append("defs")
    .append("svg:linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

legend.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "rgb(253, 246, 224)")
    .attr("stop-opacity", 1);

legend.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgb(128, 80, 43)")
    .attr("stop-opacity", 1);

key.append("rect")
    .attr("width", w)
    .attr("height", h)
    .style("fill", "url(#gradient)")
    .attr("transform", "translate(0,10)");


var x2 = d3.scaleLinear()
    .range([300, 0])
    .domain([20000, 0]);

var xAxis = d3.axisRight()
    .scale(x2)
    .ticks(7);

key.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0,20)")
    .call(xAxis)
      //.append("text")
      //.attr("transform", "rotate(-90)")
      //.attr("y", 0)
      //.attr("dy", ".71em")
      //.style("text-anchor", "end")
      //.text("axis title");