mapboxgl.accessToken = 'pk.eyJ1IjoidHJpZ2VvIiwiYSI6ImNsOXlmZXlheTA0a3kzdmxuemE5MHVsMnQifQ.abEIHxGUIn-Yz1IwcRTT7Q'
const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v10', // stylesheet location; feel free to change this if you prefer another style, but choose something simple that includes the road network. 
  center: [-122.4443, 47.2529], // starting position
  zoom: 10 // starting zoom
});

// Hospital & library point layers added to map
map.on('load', function() {
    map.addLayer({
      id: 'hospitals',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: hospitalPoints
      },
      layout: {
        'icon-image': 'hospital-15',
        'icon-allow-overlap': true
      },
      paint: { }
    });
    map.addLayer({
      id: 'libraries',
      type: 'symbol',
      source: {
        type: 'geojson',
        data: libraryPoints
      },
      layout: {
        'icon-image': 'library-15',
        'icon-allow-overlap': true
      },
      paint: { }
    });
    
    map.addSource('nearest-hospital', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [
          ]
        }
      });
    
  });

//   hospital popup
var popup = new mapboxgl.Popup();
    map.on('click', 'hospitals', function(e) {
    var feature = e.features[0];
    popup.setLngLat(feature.geometry.coordinates)
    .setHTML(feature.properties.NAME + '<br>' + feature.properties.ADDRESS + '<br>' + feature.properties.CITY + ', WA ' + feature.properties.ZIP)
    .addTo(map);
});

// turf event listener
map.on('click', 'libraries', function(f) {
  // Using Turf, find the nearest hospital to library clicked
  var refLibrary = f.features[0];
  var nearestHospital = turf.nearest(refLibrary, hospitalPoints);

  	// Update the 'nearest-hospital' data source to include the nearest library
	map.getSource('nearest-hospital').setData({
      type: 'FeatureCollection',
      features: [
        nearestHospital
        ]
  });

// Create a new circle layer from the 'nearest-hospital' data source
map.addLayer({
  id: 'nearestHospitalLayer',
  type: 'circle',
  source: 'nearest-hospital',
  paint: {
  'circle-radius': 12,
  'circle-color': '#486DE0'
  }
}, 'hospitals');

// distance between library and nearest hospital
var distance = turf.distance(refLibrary, nearestHospital, {units: 'miles'});
  distance = distance.toFixed(2);

//Add popup that gives name of the library and the name and address of the nearest hospital
popup.setLngLat(refLibrary.geometry.coordinates)
    .setHTML('<b>' + refLibrary.properties.BRANCH +  ' Branch Library' + '</b><br>The nearest hospital is ' + nearestHospital.properties.NAME + ', located at ' + nearestHospital.properties.ADDRESS + '<br>. It is ' + distance + ' miles away.')
    .addTo(map);

});

// attribution
map.addControl(new mapboxgl.AttributionControl({
  compact: true,
  customAttribution: 'Map data; <a href="https://gisdata-piercecowa.opendata.arcgis.com/datasets/public-health-care-facilities/explore">Public Health Care Facilities</a> and, <a href="https://gisdata-piercecowa.opendata.arcgis.com/datasets/libraries/explore">Pierce County Libraries</a>'
}));
