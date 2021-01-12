//svgWidth = .poll-container width - 20px padding
var svgWidth = 560,
    svgHeight = 100,
    spacingSVG = 50;
var demSeatsWidth = 120,
    repSeatsWidth = 120;

var svg = d3.select("svg")
    //.attr("width", svgWidth)
    //.attr("height", svgHeight)
    .attr("viewBox", `0 0 ` + svgWidth + ` ` + svgHeight)
    .attr("class", "svg-container");

var demRect = svg.append("rect")
    .attr("x", 0)
    .attr("y", spacingSVG)
    .attr("width", demSeatsWidth)
    .attr("height", svgHeight - spacingSVG)
    .attr("fill", "blue")

var demVotes = svg.append("text")
    .attr("x", 1)
    .attr("y", 35)
    .text("--")
    .attr("fill", "blue")
    .attr("font-size", "20px");

var demLabel = svg.append("text")
    .attr("x", 2)
    .attr("y", 80)
    .text("Democrats")
    .attr("fill", "white")
    .attr("font-size", "20px");

var repRect = svg.append("rect")
    .attr("x", svgWidth - repSeatsWidth)
    .attr("y", spacingSVG)
    .attr("width", repSeatsWidth)
    .attr("height", svgHeight - spacingSVG)
    .attr("fill", "red");

var repVotes = svg.append("text")
    .attr("x", svgWidth - 35)
    .attr("y", 35)
    .text("--")
    .attr("fill", "red")
    .attr("font-size", "20px");

var repLabel = svg.append("text")
    .attr("x", svgWidth - 110)
    .attr("y", 80)
    .text("Republican")
    .attr("fill", "white")
    .attr("font-size", "20px");

var limitValue = svg.append("text")
    .attr("x", (svgWidth / 2) - 18)
    .attr("y", 30)
    .text("270")
    .attr("font-size", "20px");

var line = svg.append("line")
    .attr("x1", svgWidth / 2)
    .attr("x2", svgWidth / 2)
    .attr("y1", 35)
    .attr("y2", svgHeight)
    .attr("stroke", "grey")
    .attr("stroke-width", 3);

function drawpollVis() {
    demSeatsWidth = svgWidth * demSeats / 540
    repSeatsWidth = svgWidth * repSeats / 540

    demRect.attr("width", demSeatsWidth)

    repRect.attr("x", svgWidth - repSeatsWidth)
        .attr("width", repSeatsWidth)

    demVotes.text(demSeats);
    repVotes.text(repSeats);
}


//////// Logic //////////
let electors;
let demSeats = 0;
let repSeats = 0;

function addElectors() {
    d3.dsv(';', DATA_DIR + "electors.csv").then(function (entry) {
        electors = entry;

        //Add Electors to countryData
        electors.forEach(elector => {
            for (let i = 0; i < mapData.features.length; i++) {
                if (mapData.features[i].properties.name === elector.state) {
                    mapData.features[i].properties.electors = elector.numberOfVotes;
                    mapData.features[i].properties.polled = "no";
                    break;
                }
            }
        })
    })
    console.log(mapData)
}


var pollTable = document.getElementById("table-content");

function updatePolls(newPolls) {
    pollTable.innerHTML = ''
    demSeats = 0;
    repSeats = 0;

    // Update Seat Visualication 
    mapData.features.forEach(state => {
        if (state.properties.votesDem >= state.properties.votesRep) {
            demSeats += Number(state.properties.electors)
        } else if (state.properties.votesRep >= state.properties.votesDem) {
            repSeats += Number(state.properties.electors)

        }
        // else {
        //     console.log("Error of Comparing State " + state.properties.name)
        //     console.log("Votes Democrats: " + state.properties.votesDem)
        //     console.log("Votes Republican: " + state.properties.votesRep)
        // }
    })

    // Update Seat-State Table
    mapData.features.forEach(state => {

        var newParent = document.createElement('div');
        newParent.id = "poll-table-row";
        newParent.className = "poll-table-row";

        var newState = document.createElement('div');
        newState.id = "poll-state";
        newState.className = "row-state";
        newState.innerHTML = state.properties.name

        var newDem = document.createElement('div');
        newDem.id = "poll-dem";
        newDem.className = "row-dem";
        newDem.innerHTML = state.properties.votesDem

        var newRep = document.createElement('div');
        newRep.id = "poll-rep";
        newRep.className = "row-rep";
        newRep.innerHTML = state.properties.votesRep

        newParent.appendChild(newState)
        newParent.appendChild(newDem)
        newParent.appendChild(newRep)

        pollTable.append(newParent)
    })

    drawpollVis()
}