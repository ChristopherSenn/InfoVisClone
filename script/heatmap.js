"use strict";

const DATA_DIR = "http://127.0.0.1:8080//assets/data/"

//Width and height of map
const HeatmapWidth = 960;
const HeatmapHeight = 450;

// D3 Projection
const projection = d3.geoAlbersUsa()
	.translate([HeatmapWidth / 2, HeatmapHeight / 2]) // translate to center of screen
	.scale(1000); // scale things down so see entire US

// Define path generator
const path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
	.projection(projection); // tell path generator to use albersUsa projection


const color = d3.scaleLinear()
	.domain([-900, 20000])
	.range(['rgb(253, 246, 224)', 'rgb(128, 80, 43)'])
	.interpolate(d3.interpolateHcl); //interpolateHsl interpolateHcl interpolateRgb


//Create SVG element and append map to the SVG
const heatmapSvg = d3.select("#heatmap-container")
	.append("svg")
	//.attr("width", HeatmapWidth)
	//.attr("height", HeatmapHeight)
	.attr("viewBox", `0 0 ` + HeatmapWidth + ` ` + HeatmapHeight)
// Current popup state; ture if visible, flase if not
let popupIsVisible = false;

let mapData;
let mapCentres;


function updateHeatmap(currentCases, newPolls) {
	if(mapCentres == undefined) {
		d3.json(DATA_DIR + "us-states-centres.json").then(function (json) {
			mapCentres = json;

		})
	}



	if (mapData == undefined) {
		d3.json(DATA_DIR + "us-states.json").then(function (json) {
			mapData = json;

			// Write mapCentres data into mapDate on init
			mapCentres.features.forEach(center => {
				for (let i = 0; i < mapData.features.length; i++) {
					if (mapData.features[i].properties.name === center.state) {
						mapData.features[i].properties.center = {
							lat: center.lat,
							long: center.long
						};
						break;
					}
				}

			})

			drawHeatmap(currentCases, newPolls, mapData);
			addElectors()


		});
	} else {
		updatePolls(newPolls);
		drawHeatmap(currentCases, newPolls, mapData);
	}
	
}




function resetCases() {
	mapData.features.forEach(state => {
		state.properties.cases = 0;
	})
}

function drawHeatmap(currentCases, newPolls, mapData) {
	if (currentCases.length != 0) { // Check if new case data was submitted for this day
		// If so, all the case counts get set to 0 to be reset in the next for loop
		// This results in "No Data transmitted for this day for this state (but for at least 1 other state) -> There are 0 cases in this state and the color gets reset to default"
		resetCases();
	}

	newPolls.forEach(newPoll => {
		let pollState = newPoll.stateName;

		for (let i = 0; i < mapData.features.length; i++) {
			let jsonState = mapData.features[i].properties.name;

			if (pollState == jsonState) {
				mapData.features[i].properties.votesDem = newPoll.biden;
				mapData.features[i].properties.votesRep = newPoll.trump;
			}
		}
	})

	// Loop through the case data and update the old cases in the mapData array
	currentCases.forEach(currentCase => {
		let dataState = currentCase.state;
		let dataValue = currentCase.casesPerDay;

		// Find the corresponding state inside the GeoJSON
		for (let i = 0; i < mapData.features.length; i++) {
			let jsonState = mapData.features[i].properties.name;

			if (dataState == jsonState) {

				// Copy the data value into the JSON
				mapData.features[i].properties.cases = dataValue;

				// Data for popup
				mapData.features[i].properties.totalCases = currentCase.cases;
				mapData.features[i].properties.totalDeaths = currentCase.deaths;

				// Stop looking through the JSON
				break;
			}
		}
	})

	// Color must be set seperately from all other modifiers to be changeable over time apparently
	heatmapSvg.selectAll("path").style("fill", function (d) {
		let value = parseInt(d.properties.cases);
		if (value) {
			return color(value);
		} else {
			//Emergency fallback; this should never be called except for the initial drawing of the map
			return 'rgb(253, 246, 224)';
		}
	})



	// Add data and styles
	heatmapSvg.selectAll("path")
		.data(mapData.features)
		.enter()
		.append("path")
		.attr("d", path)
		.style("stroke", "#333")
		.style("stroke-width", "1")
		.style("fill", "rgb(213,222,217)") // Default background
		.on("click", function (d, i, k) {
			console.log(d)
			//Make popup visible on click and set its values to the current values of the selected state
			let popup = document.getElementById("heatmap-popup");
			popup.style.display = "inline-block";
			//console.log(popup)
			popup.style.top = d.y + "px";
			popup.style.left = d.x + "px";
			//console.log(d);
			popupIsVisible = true;
			document.getElementById("popup-headline").innerHTML = i.properties.name;
			document.getElementById("popup-cases-total").innerHTML = i.properties.totalCases;
			document.getElementById("popup-cases-per").innerHTML = i.properties.cases;
			document.getElementById("popup-deaths").innerHTML = i.properties.totalDeaths;
			document.getElementById("popup-percent-rep").innerHTML = i.properties.votesRep;
			document.getElementById("popup-percent-dem").innerHTML = i.properties.votesDem;
		})


	//if popup is currently visible, update its numbers every tick
	if (popupIsVisible) {
		currentCases.forEach(feature => {
			if (feature.state.localeCompare(document.getElementById("popup-headline").innerHTML) === 0) {
				document.getElementById("popup-cases-total").innerHTML = feature.cases;
				document.getElementById("popup-cases-per").innerHTML = feature.casesPerDay;
				document.getElementById("popup-deaths").innerHTML = feature.deaths;

			}
		})

		newPolls.forEach(poll => {
			if (poll.stateName.localeCompare(document.getElementById("popup-headline").innerHTML) === 0) {
				document.getElementById("popup-percent-rep").innerHTML = poll.trump;
				document.getElementById("popup-percent-dem").innerHTML = poll.biden;
			}
		})
	}
	// Remove all previous drawn svgs to reduce lag and avoid overlaps
	heatmapSvg.selectAll('image').remove();

	// Update State centres
	heatmapSvg.selectAll('path').each(function (d, i, k) {
		// Append poll result image
		heatmapSvg.append("image") 
		// Calculate current state center x and y from lat and long
		.attr('x', function () {
			if(d.properties.center !== undefined) {
				return projection([d.properties.center.long, d.properties.center.lat])[0] - 10; // -10 to center the image over the coordinate (10 = half width)
			}
			else return -100;
		})
		.attr('y', function () {
			if(d.properties.center !== undefined) {
				return projection([d.properties.center.long, d.properties.center.lat])[1] - 12; // -12 to center the image over the coordinate (12 = half height)
			}
			else return -100;
		})
		// Set Size
		.attr('width', 20)
		.attr('height', 24)
		// Set SVG depending on poll results
		.attr("xlink:href", function() {
			//if(d.properties.name == "Vermont") console.log(d.properties.votesDem)
			if(d.properties.votesDem && d.properties.votesRep) {
				if(d.properties.votesDem >= d.properties.votesRep) {
					return "assets/icons/democrat.svg";
				}
				else {
					return "assets/icons/republican.svg";
				}
			}
				else {
					return "" // Emergency fallback for no poll results; this should never happen as it results in no image being drawn.
				}

			})
			.on("click", function (event) {
				console.log(d)
				//Make popup visible on click and set its values to the current values of the selected state
				let popup = document.getElementById("heatmap-popup");
				popup.style.display = "inline-block";
				//console.log(popup)
				popup.style.top = event.y + "px";
				popup.style.left = event.x + "px";
				//console.log(d);
				popupIsVisible = true;
				document.getElementById("popup-headline").innerHTML = d.properties.name;
				document.getElementById("popup-cases-total").innerHTML = d.properties.totalCases;
				document.getElementById("popup-cases-per").innerHTML = d.properties.cases;
				document.getElementById("popup-deaths").innerHTML = d.properties.totalDeaths;
				document.getElementById("popup-percent-rep").innerHTML = d.properties.votesRep;
				document.getElementById("popup-percent-dem").innerHTML = d.properties.votesDem;
			})
	})

}

function closePopup() {
	let popup = document.getElementById("heatmap-popup");
	popup.style.display = "none";
	popupIsVisible = false;
}