var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
	.translate([width / 2, height / 2])    // translate to center of screen
	.scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
	.projection(projection);  // tell path generator to use albersUsa projection



//Create SVG element and append map to the SVG
var svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);


d3.json("http://localhost:8000/Backend/csv/us-states.json", function (json) {
	drawMap(json)
})


function drawMap(json) {
	svg.selectAll("path")
	.data(json.features)
	.enter()
	.append("path")
	.attr("d", path)
	.style("stroke", "#000")
	.style("stroke-width", "1")
	.style("fill", "rgb(213,222,217)");
}

