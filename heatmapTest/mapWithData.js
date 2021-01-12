var width = 960;
var height = 500;

// D3 Projection
var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2])    // translate to center of screen
    .scale([1000]);          // scale things down so see entire US

// Define path generator
var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
    .projection(projection);  // tell path generator to use albersUsa projection

// Define linear scale for output
var color = d3.scale.linear()
    .range(["rgb(213,222,217)", "rgb(69,173,168)", "rgb(84,36,55)", "rgb(217,91,67)"]);


//Create SVG element and append map to the SVG
var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.csv("http://localhost:8000/Backend/csv/stateslived.csv", function (data) {
    color.domain([0, 1, 2, 3]); // setting the range of the input data

    d3.json("http://localhost:8000/Backend/csv/us-states.json", function (json) {
        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {

            // Grab State Name
            var dataState = data[i].state;

            // Grab data value 
            var dataValue = data[i].visited;

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;

                if (dataState == jsonState) {

                    // Copy the data value into the JSON
                    json.features[j].properties.visited = dataValue;

                    // Stop looking through the JSON
                    break;
                }
            }
        }

        drawMap(json)
    })
})


function drawMap(json) {
    svg.selectAll("path")
        .data(json.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("stroke", "#fff")
        .style("stroke-width", "1")
        .style("fill", function(d) {

            // Get data value
            var value = d.properties.visited;
        
            if (value) {
            //If value exists…
            return color(value);
            } else {
            //If value is undefined…
            return "rgb(213,222,217)";
            }
        });
}
