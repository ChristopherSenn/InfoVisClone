
// set the dimensions and margins depending on the map
const barChartMargin = {top: 30, right: 30, bottom: 70, left: 60},
    barChartWidth = HeatmapWidth,
    barChartHeight = HeatmapHeight/3;

// append the svg object to the body of the chart for the cases
const columnCasesSvg = d3.select("#columnChartCases")
    .append("svg")
    //.attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
    //.attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
    .attr("viewBox", `0 0 ` + (barChartWidth + barChartMargin.left + barChartMargin.right) + ` ` +  (barChartHeight + barChartMargin.top + barChartMargin.bottom))
    .append("g")
    .attr("transform",
        "translate(" + barChartMargin.left + "," + barChartMargin.top + ")");

// append the svg object to the body of the chart for the deaths
const columnDeathSvg = d3.select("#columnChartDeaths")
    .append("svg")
    //.attr("width", barChartWidth + barChartMargin.left + barChartMargin.right)
    //.attr("height", barChartHeight + barChartMargin.top + barChartMargin.bottom)
    .attr("viewBox", `0 0 ` + (barChartWidth + barChartMargin.left + barChartMargin.right) + ` ` +  (barChartHeight + barChartMargin.top + barChartMargin.bottom))
    .append("g")
    .attr("transform",
        "translate(" + barChartMargin.left + "," + barChartMargin.top + ")");

// define the x scale
const barChartXVal = d3.scaleBand()
    .range([0, barChartWidth])
    .padding(0.2);

// define the y scale for the cases
const barChartYVal = d3.scaleLinear()
    .domain([0, 1600000])
    .range([barChartHeight, 0]);

// define the y scale for the deaths
const barChartYValDeath = d3.scaleLinear()
    .domain([0, 35000])
    .range([barChartHeight, 0]);

// append the y scale to the svg for cases
columnCasesSvg.append("g")
    .call(d3.axisLeft(barChartYVal));

// append the y scale to the svg for deaths
columnDeathSvg.append("g")
    .call(d3.axisLeft(barChartYValDeath));

var columnData;
var showData = 1;

if (columnData === undefined) {
    d3.json(DATA_DIR + "covid_states.json").then(function (json) {
        columnData = json;
        barChartXVal.domain(columnData.map(function (d) {
            return d.name;
        }));

        // append it to both svgs
        columnCasesSvg.append("g")
            .attr("transform", "translate(0," + barChartHeight + ")")
            .call(d3.axisBottom(barChartXVal))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        columnDeathSvg.append("g")
            .attr("transform", "translate(0," + barChartHeight + ")")
            .call(d3.axisBottom(barChartXVal))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

// create the bars
        columnCasesSvg.selectAll("mybar")
            .data(columnData)
            .enter()
            .append("rect")
            .attr("x", function(d) { return barChartXVal(d.name); })
            .attr("y", function(d) { return barChartYVal(d.cases); })
            .attr("width", barChartXVal.bandwidth())
            .attr("height", function(d) { return barChartHeight - barChartYVal(d.cases); })
            .attr("fill", "#69b3a2")


        columnDeathSvg.selectAll("mybar")
            .data(columnData)
            .enter()
            .append("rect")
            .attr("x", function(d) { return barChartXVal(d.name); })
            .attr("y", function(d) { return barChartYValDeath(d.deaths); })
            .attr("width", barChartXVal.bandwidth())
            .attr("height", function(d) { return barChartHeight - barChartYValDeath(d.deaths); })
            .attr("fill", "#69b3a2")
    });
}

function updateData(currentCases) {

    if(columnData == undefined) {
        d3.json(DATA_DIR + "covid_states.json").then(function (json) {
            columnData = json;
            drawColumn(currentCases, columnData);
        });
    } else {
        drawColumn(currentCases, columnData);
    }
}

function resetCases() {
    columnData.forEach(name => {
        name.cases = 0;
        name.deaths = 0;
    })
}

function drawColumn(currentCases, columnData) {

    if (currentCases.length != 0) {
        resetCases();
    }

    // update the dataset according to the timeslider data
    currentCases.forEach(currentCase => {
        let dataState = currentCase.state;

        for (let i = 0; i < columnData.length; i++) {

            if (dataState === columnData[i].name) {
                columnData[i].cases = currentCase.cases;
                columnData[i].deaths = currentCase.deaths;
                break;
            }
        }
    })

    //  plot the total cases
    columnCasesSvg.selectAll("rect")
        .data(columnData)
        .transition()
        .attr("x", function(d) { return barChartXVal(d.name); })
        .attr("y", function(d) { return barChartYVal(d.cases); })
        .attr("width", barChartXVal.bandwidth())
        .attr("height", function(d) { return barChartHeight - barChartYVal(d.cases); })

    //  plot the total deaths
    columnDeathSvg.selectAll("rect")
        .data(columnData)
        .transition()
        .attr("x", function(d) { return barChartXVal(d.name); })
        .attr("y", function(d) { return barChartYValDeath(d.deaths); })
        .attr("width", barChartXVal.bandwidth())
        .attr("height", function(d) { return barChartHeight - barChartYValDeath(d.deaths); })

    showValue(showData);
}

// choosing which values are shown: total cases or deaths
function showValue(value) {
    d1 = document.getElementById("columnChartCases");
    d2 = document.getElementById("columnChartDeaths");
    if(value === 1) {
        showData = 1;
        d1.style.display = "block";
        d2.style.display = "none";
    } else {
        showData = 0;
        d1.style.display = "none";
        d2.style.display = "block";
    }
}

function swapTopLeft(val) {

    if(val == 1) {
        document.getElementById("poll-container").style.display = "none"
        document.getElementById("line-chart-container").style.display = "block"
    } else {
        document.getElementById("poll-container").style.display = "block"
        document.getElementById("line-chart-container").style.display = "none"
    }
}