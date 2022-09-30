var sfCoords = [37.7749, -122.4194];
var mapZoomLevel = 4;

// Create the createMap function.
function createMap(quakeLayer)
{

  // Create the tile layer that will be the background of our map.
   var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });


  // Create a baseMaps object to hold the streetmap layer.
  var baseMaps = {
    "Street Map": streetmap

  };

  // Create an overlayMaps object to hold the bikeStations layer.
  var overlayMaps = {
    "Earthquake Data": quakeLayer
  };

  // Create the map object with options.
  var map = L.map("map", {
    center: sfCoords,
    zoom: mapZoomLevel,
    layers: [streetmap, quakeLayer]
  })

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  
// make a variable for the legend and position it
    var legend = L.control(
        {
            position: "bottomright"
        }
        );

    // add the properties for the legend
    legend.onAdd = function ()
    {
    // create a div for the legend
    var div = L.DomUtil.create("div", "info legend");
    console.log(div);

    var intervals = [-10, 10, 30, 50, 70, 90]; // this array represents the intervals
                                    // for the capacities of the bike stations
    // this array represents the colors that will be assocaited with the intervals
    // (populate these in reverse)
    var colors = [
        "Green",
        "LightGreen",
        "LightSalmon",
        "DarkOrange",
        "OrangeRed",
        "DarkRed"
    ];

    // use a loop to generate labels within the div
    // div starts as empty, then is populated with the data from the arrays
    for(var i = 0; i < intervals.length; i++)
    {
        // display the colors and interval values
        //console.log(colors[i]);
        //console.log(intervals[i]);
        // use .innerHTML to set the color and the text for the interval
        div.innerHTML += "<i style='background: " + colors[i] + "'></i>"
        + intervals[i]
        + (intervals[i + 1] ? "&ndash;" + intervals[i + 1] + " depth<br>" : "+ depth");
    }

    return div;
    }; 
    
    // add the legend to the map
    legend.addTo(map);
}

// Create the createMarkers function.
function createMarkers(data)
{
  //console.log(data);

  // Pull the "stations" property from response.data.
  //creates an array of stations that we can use to get the data that we need
  var earthquakeData = data.features;

  //console.log(earthquakeData)

  // Initialize an array to hold the bike markers.
  var earthquakeMarkers = [];
  var highDepth = [];  // array for high depth - -10 to 10
  var highmidDepth = [];   // array for 10 - 30 
  var midhighDepth = [];  // array for 30 - 50
  var midlowDepth = [];  // array for 50 - 70
  var lowmidDepth = []; // array for 70 - 90
  var lowDepth = [];   // array for low depths - under 90 km

  // Loop through the stations array.
  for(var i = 0; i < earthquakeData.length; i++)
  {
    //console.log(earthquakeData[i].geometry.coordinates[2]);

    var quakeTime = new Date(earthquakeData[i].properties.time);
    
    
    //console.log(quakeTime);


    var markerRadius = earthquakeData[i].properties.mag * 10000;
    var markerColor;

    if(earthquakeData[i].geometry.coordinates[2] < 10)
        markerColor = "Green";
    else if(earthquakeData[i].geometry.coordinates[2] <= 30 )
        markerColor = "LightGreen";  // light green
    else if(earthquakeData[i].geometry.coordinates[2] <= 50 )
        markerColor = "LightSalmon";  // light orange
    else if(earthquakeData[i].geometry.coordinates[2] <= 70 )
        markerColor = "DarkOrange";   
    else if(earthquakeData[i].geometry.coordinates[2] <= 90 )
        markerColor = "OrangeRed";  // dark orange
    else   
        markerColor = "DarkRed";


    // For each feature, create a marker, and bind a popup with the feature's name.
    var earthquake = L.circle([earthquakeData[i].geometry.coordinates[1], earthquakeData[i].geometry.coordinates[0]], {
        fillOpacity: .70,
        color: markerColor, // blue for now, add color in step 3
        fillcolor: markerColor,
        radius: markerRadius,
        weight: 1
    })
      .bindPopup(`<h2>Title: ${earthquakeData[i].properties.title}</h2><hr>
      <b>Magnitude: </b> ${earthquakeData[i].properties.mag}<br>
      <b>Depth: </b>${earthquakeData[i].geometry.coordinates[2]}<br>
      <b>Date/Time: </b>${quakeTime}`)

    if(earthquakeData[i].geometry.coordinates[2] < 10)
        markerColor = "green";
    else if(earthquakeData[i].geometry.coordinates[2] <= 30 )
        markerColor = "#7DCEA0";  // light green
    else if(earthquakeData[i].geometry.coordinates[2] <= 50 )
        markerColor = "#F5B041";  // light orange
    else if(earthquakeData[i].geometry.coordinates[2] <= 70 )
        markerColor = "orange";   
    else if(earthquakeData[i].geometry.coordinates[2] <= 90 )
        markerColor = "#BA4A00";  // dark orange
    else   
        markerColor = "red";

    // Add the marker to the bikeMarkers array.
    earthquakeMarkers.push(earthquake);
    //console.log(earthquake)
    //if(stations[i].capacity > 40)
    //    highCap.push(bikeStation);
    //else if(stations[i].capacity >= 25)
    //    medCap.push(bikeStation);
    //else   
    //    lowCap.push(bikeStation);
  }  
  // Create a layer group that's made from the bike markers array, and pass it to the createMap function.
  var quakeLayer = L.layerGroup(earthquakeMarkers);
  //var highLayer = L.layerGroup(highCap);
  //var medLayer = L.layerGroup(medCap);
  //var lowLayer = L.layerGroup(lowCap);

  createMap(quakeLayer);
  //createMap(highLayer, medLayer, lowLayer);
}



d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(
    createMarkers
);