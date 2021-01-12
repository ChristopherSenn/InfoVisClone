"use-strict";

const formatDateIntoMonth = d3.timeFormat("%e. %b");
const formatDate = d3.timeFormat("%e. %b %Y");
const parseDate = d3.timeParse("%Y-%m-%d");

const startDate = new Date("2020-01-01"),
    endDate = new Date("2020-12-31");

const timeSliderMargin = { top: 50, right: 50, bottom: 0, left: 50 },
    timeSliderWidth = 960 - timeSliderMargin.left - timeSliderMargin.right,
    timeSliderHeight = 100 - timeSliderMargin.top - timeSliderMargin.bottom;

const timeSliderSvg = d3.select("#time-slider-container")
    .append("svg")
    //.attr("width", timeSliderWidth + timeSliderMargin.left + timeSliderMargin.right)
    //.attr("height", timeSliderHeight + timeSliderMargin.top + timeSliderMargin.bottom)
    .attr("viewBox", `0 0 ` +
        (timeSliderWidth + timeSliderMargin.left + timeSliderMargin.right) + ` ` +
        (timeSliderHeight + timeSliderMargin.top + timeSliderMargin.bottom))



let moving = false;
let currentValue = 0;
let target = 0;
const targetValue = timeSliderWidth;

const playButton = d3.select("#play-button");

const x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, targetValue])
    .clamp(true);

const slider = timeSliderSvg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + timeSliderMargin.left + "," + 50 + ")");

// Slider
slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
        .on("start.interrupt", function () { slider.interrupt(); })
        .on("start drag", function (d) {
            //currentValue = d.x
            console.log("start")
            //update(x.invert(currentValue));
            target = d.x
            timer = setInterval(() => step(), 100);
        })
        .on("drag", function(d) {
            console.log("drag")
            //console.log(d.x)
            //currentValue = d.x
            //moving = false;
            //clearInterval(timer);
            target = d.x;
            //timer = setInterval(() => step(), 100);
        })
        .on("end.interrupt", function() {
            console.log("end interrupt")
            moving = false;
            clearInterval(timer);
        })
        
    )
    /*.on("mousedown", function (event) {
        console.log(event)
        timer = setInterval(() => step(targetValue), 100);
    })
    .on("mouseup", function(){
        clearInterval(timer)
    });*/

//Month Labels
slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .text(function (d) {
        return formatDateIntoMonth(d);
    });

// Slider Handle
const handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9);

// Current Info
const label = slider.append("text")
    .attr("class", "label")
    .attr("text-anchor", "middle")
    .text(formatDate(startDate))
    .attr("transform", "translate(0," + (-25) + ")")


////////// plot //////////

let dataset;
let pollData;


d3.csv(DATA_DIR + "covid_states_full_changes.csv", prepare).then(function (data) {
    d3.dsv(";", DATA_DIR + "election_polls.csv", prepare).then(function (polls) {


        pollData = polls;
        dataset = data;

        update(x.invert(currentValue));
        playButton
            .on("click", function () {
                let button = d3.select(this);
                if (button.text() == "Pause") {
                    moving = false;
                    clearInterval(timer);
                    // timer = 0;
                    button.text("Play");
                } else {
                    moving = true;
                    target = targetValue;
                    timer = setInterval(() => step(), 100);
                    button.text("Pause");
                }
                console.log("Slider moving: " + moving);
            })
    })
})

function prepare(d) {
    d.date = parseDate(d.date);
    return d;
}

function step() {
    update(x.invert(currentValue));
    currentValue = currentValue + (targetValue / 500);
    if (currentValue > target) {
        moving = false;
        if(currentValue > targetValue) {
            currentValue = 0;
        }
        //currentValue = 0;
        clearInterval(timer);

        playButton.text("Play");
        console.log("Slider moving: " + moving);
        resetCases(); // Set all cases on map to 0 to allow a fresh start when play is pressed again
    }
}


function update(h) {
    // update position and text of label according to slider scale
    handle.attr("cx", x(h));
    label
        .attr("x", x(h))
        .text(formatDate(h));
    // Filter Dataset for the current date
    let newData = dataset.filter(function (d) {
        return getDateAsString(d.date) === getDateAsString(h);
    })

    let newPolls = pollData.filter(function(d) {

        if(d.endDate) {
            tempDate = new Date(d.endDate);
            tempDate.setTime(tempDate.getTime() + (60*60*1000)); // Add 1h to Date so it matches the h date when transformed to iso
            return getDateAsString(tempDate) === getDateAsString(h)
        }
        
        else return null
    })
    
    //console.log(newPolls)
    updateHeatmap(newData, newPolls);
    
}

function getDateAsString(date) {
    return date.toISOString().slice(0, 10).replace(/-/g, "");
}