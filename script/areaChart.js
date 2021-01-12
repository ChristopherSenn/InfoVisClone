"use strict";

// set the dimensions and margins of the graph 
const margin = {top: 10, right: 30, bottom: 30, left: 50},
      width = 660 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const areachartSvg = d3.select("#areachart")
  .append("svg")
//.attr("width", width + margin.left + margin.right)
//.attr("height", height + margin.top + margin.bottom)
  .attr("viewBox", `0 0 ` + (width + margin.left + margin.right) + ` ` + (height + margin.top + margin.bottom))
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function drawAreaChart() {
  // Clear Data
  let areaChartData = new Array();
  areachartSvg.selectAll('*').remove();

  // Get data
  let isCasesPerDayChecked = d3.select("input[name='caseSwitch']").property("checked");

  let grouped = d3.group(dataset, d => +d.date);
  grouped.forEach(function(day) {
    let d = day[0].date;
    let c = 0;

    day.forEach(function(o) {
      if(isCasesPerDayChecked) {
        c = c + parseInt(o.casesPerDay);
      } else {
        c = c + parseInt(o.cases);
      }
    });

    areaChartData.push({
      date: d,
      cases: c
    });
  });

  // Add X axis --> it is a date format
  const areachartX = d3.scaleTime()
    .domain(d3.extent(areaChartData, function(d) { return d.date; }))
    .range([ 0, width ]);
  
  // Add Y axis
  const areachartY = d3.scaleLinear()
    .domain([0, d3.max(areaChartData, function(d) { return d.cases; })])
    .range([height, 0]);

    // Add the area
  areachartSvg.append("path")
    .datum(areaChartData)   
    .attr("fill", "#cce5df")
    .attr("stroke", "#69b3a2")
    .attr("stroke-width", 1.5)
    .attr("d", d3.area()
      .curve(d3.curveLinear)
      .x(d => areachartX(d.date))
      .y0(areachartY(0))
      .y1(d => areachartY(d.cases))
    )
    
  areachartSvg.append("g")
    .call(d3.axisLeft(areachartY)
    .tickFormat(d3.format("~s")));
  
  areachartSvg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(areachartX)
      .tickValues(areachartX.ticks(10))
      .tickFormat(d => formatDateIntoMonth(d))
    );

  addxLabel();
  addyLabel();
}    

// Add X axis label:
function addxLabel(){
  areachartSvg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 20)
    .text("Date");
}

// Add Y axis label:
function addyLabel(){
  areachartSvg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left+10)
    .attr("x", -margin.top)
    .text("Case Numbers")
}


function updateAreachart(){
//TODO
}
