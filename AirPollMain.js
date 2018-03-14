

var dataPointMarkers = [];
var dataPointCircles = [];


/**
 * Creates a map object with a click listener and a heatmap.
 */
function initApp() {

	var map = initMap();
	var heatmap = initHeatmap(map);
	var config = initFirebase(); //Firebase API key stuff:
	firebase.initializeApp(config);
	var dataPointsDbRef = firebase.firestore().collection('datapoints');

	addMapClickListener(map, heatmap, dataPointsDbRef);
	addDataPointDbListener(dataPointsDbRef, map);
	addFormButtonListeners();

	displayGrid();
}

function initMap() {
	return new google.maps.Map(document.getElementById('map'), {
		center: {lat: 50.9365, lng: -1.396},
		zoom: 18,
		//hide points of interest and public transport
		styles: [{
			featureType: 'poi',
			stylers: [{ visibility: 'off' }]
		}, {
			featureType: 'transit.station',
			stylers: [{ visibility: 'off' }]
		}],
		disableDoubleClickZoom: true,
		streetViewControl: false
	});
}

//Heatmap is only used to show where we have data
function initHeatmap(map) {
	var heatmap = new google.maps.visualization.HeatmapLayer();
	heatmap.setMap(map);
	return heatmap;
}

function initFirebase() {
	return {
	};
}

function addMapClickListener(map, heatmap, dataPointsDbRef) {
	map.addListener('click', function(mapLayer) {

		var dataPoint = {
			latlng: mapLayer.latLng.toJSON(),
			value: Math.floor((Math.random() * 100)).toString(),
			date: new Date().toUTCString()
		};

		addNewDataPointClickToDb(dataPointsDbRef, dataPoint);
		addMarkerToMap(map, dataPoint);
		// heatmap.getData().push(latlng); hiding heatmap
	});
}

function addNewDataPointClickToDb(dataPointsDbRef, dataPoint) {
	dataPointsDbRef.add(dataPoint).then(function(docRef) {
		console.log("Document written with ID: ", docRef.id);
	}).catch(function(error) {
		console.error("Error adding document: ", error);
	});
}

function addDataPointDbListener(dataPointsDbRef, map) {
	dataPointsDbRef.get().then(function(dataPoints) {
		dataPoints.forEach(function(dataPoint) {
			addMarkerToMap(map, dataPoint.data())
		});
	});

	//TODO: get datapoints as they are added to database
}



function addMarkerToMap(map, dataPoint) {
	latlng = dataPoint.latlng;
	var hue = (100 - dataPoint.value) * 2.4;
	var colorString = "hsl(" + hue +", 100%, 50%)";
	var marker = new google.maps.Marker({
		position: latlng,
		label: dataPoint.value.toString(),
		map: map,
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			strokeColor: colorString,
			strokeOpacity: 0,
			strokeWeight: 1,
			fillColor: colorString,
			fillOpacity: 0,
			scale: 100
		}
	});

	dataPointMarkers.push(marker);

	marker.addListener('click', function() {
		var date = new Date(dataPoint.date);
		document.getElementById('date').value = date.toDateString();
		document.getElementById('time').value = date.toTimeString().split(' ')[0];
		document.getElementById('value').value = dataPoint.value;
	});

	drawCircle(latlng, map, colorString, 0.5, 10);
	drawCircle(latlng, map, colorString, 0.3, 20);
	drawCircle(latlng, map, colorString, 0.1, 40);
}

function drawCircle(latlng, map, colorString, opacity, radius) {
	dataPointCircles.push(
		new google.maps.Circle({
			strokeOpacity: 0,
			fillColor: colorString,
			fillOpacity: opacity,
			map: map,
			center: latlng,
			radius: radius
		})
	);
}

function addFormButtonListeners() {
	var showGridButton = document.getElementById('showGrid');
	showGridButton.onclick = function () {
		if (showGridButton.innerText === 'Show Data Grid') {
			showGridButton.innerText = 'Hide Data Grid';
			//TODO: Hide Grid
		} else {
			showGridButton.innerText = 'Show Data Grid';
			//TODO: Show Grid
		}
	};

	var showPointsButton = document.getElementById('showPoints');
	showPointsButton.onclick = function () {
		if (showPointsButton.innerText === 'Show Data Points') {
			showPointsButton.innerText = 'Hide Data Points';
			dataPointMarkers.forEach(function (dataPointMarker) {
				dataPointMarker.setVisible(true);
			});
		} else {
			showPointsButton.innerText = 'Show Data Points';
			dataPointMarkers.forEach(function (dataPointMarker) {
				dataPointMarker.setVisible(false);
			});
		}
	};

	var showCirclesButton = document.getElementById('showCircles');
	showCirclesButton.onclick = function () {
		if (showCirclesButton.innerText === 'Show Data Circles') {
			showCirclesButton.innerText = 'Hide Data Circles';
			dataPointCircles.forEach(function (dataPointCircle) {
				dataPointCircle.setVisible(true);
			});
		} else {
			showCirclesButton.innerText = 'Show Data Circles';
			dataPointCircles.forEach(function (dataPointCircle) {
				dataPointCircle.setVisible(false);
			});
		}
	};
}