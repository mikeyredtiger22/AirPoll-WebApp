
var allDataPoints = [];
var dataPointMarkers = [];
var dataPointCircles = [];

var showDataPoints = true;
var showDataCircles = true;
var showDataGrid = false;


/**
 * Creates a map object with a click listener and a heatmap.
 */
function initApp() {

	var map = initMap();
	var heatmap = initHeatmap(map);
	var config = initFirebase(); //Firebase API key stuff:
	firebase.initializeApp(config);
	var dataPointsDbRef = firebase.firestore().collection('datapoints');

	displayGrid(map);
	addMapClickListener(map, heatmap, dataPointsDbRef);
	addDataPointDbListener(dataPointsDbRef, map);
	addFormButtonListeners();


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
		allDataPoints.push(dataPoint);

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
			allDataPoints.push(dataPoint.data());
			addMarkerToMap(map, dataPoint.data());
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
		visible: showDataPoints,
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
			radius: radius,
			visible: showDataCircles
		})
	);
}

function addFormButtonListeners() {
	/*var showGridButton = document.getElementById('showGrid');
	showGridButton.onclick = function () {
		if (showGridButton.innerText === 'Show Data Grid') {
			showGridButton.innerText = 'Hide Data Grid';
			//TODO: Hide Grid
		} else {
			showGridButton.innerText = 'Show Data Grid';
			//TODO: Show Grid
		}
	};
*/
	var showPointsButton = document.getElementById('showPoints');
	showPointsButton.onclick = function () {
		if (showPointsButton.innerText === 'Show Data Points') {
			showDataPoints = true;
			showPointsButton.innerText = 'Hide Data Points';
			dataPointMarkers.forEach(function (dataPointMarker) {
				dataPointMarker.setVisible(true);
			});
			showPointsButton.classList.add('btn-primary');
			showPointsButton.classList.remove('btn-outline-primary');
		} else {
			showDataPoints = false;
			showPointsButton.innerText = 'Show Data Points';
			dataPointMarkers.forEach(function (dataPointMarker) {
				dataPointMarker.setVisible(false);
			});

			showPointsButton.classList.remove('btn-primary');
			showPointsButton.classList.add('btn-outline-primary');
		}
	};

	var showCirclesButton = document.getElementById('showCircles');
	showCirclesButton.onclick = function () {
		if (showCirclesButton.innerText === 'Show Data Circles') {
			showDataCircles = true;
			showCirclesButton.innerText = 'Hide Data Circles';
			dataPointCircles.forEach(function (dataPointCircle) {
				dataPointCircle.setVisible(true);
			});
			showCirclesButton.classList.add('btn-primary');
			showCirclesButton.classList.remove('btn-outline-primary');
		} else {
			showDataCircles = false;
			showCirclesButton.innerText = 'Show Data Circles';
			dataPointCircles.forEach(function (dataPointCircle) {
				dataPointCircle.setVisible(false);
			});
			showCirclesButton.classList.remove('btn-primary');
			showCirclesButton.classList.add('btn-outline-primary');
		}
	};
}

function displayGrid(map) {

	map.addListener('tilesloaded', function() {
		var text1 = document.getElementById('date');
		var text2 = document.getElementById('time');
		var text3 = document.getElementById('value');
		var text4 = document.getElementById('user');

		//Step1: find biggest square (in pixels) on map
		var bounds = map.getBounds();
		var projection = map.getProjection();

		var ne = projection.fromLatLngToPoint(bounds.getNorthEast());
		var sw = projection.fromLatLngToPoint(bounds.getSouthWest());

		var scale = Math.pow(2, map.getZoom());

		var widthPixels = (ne.x - sw.x) * scale;
		var heightPixels = (sw.y - ne.y) * scale;

		var totalSquareLengthPixels = Math.min(widthPixels, heightPixels);

		//Step 2: find grid size in pixels
		var gridLengthPixels = Math.round(totalSquareLengthPixels / 10); //Eventually changeable by slider


		//Step 3: Create grid objects with LatLng coordinates
		var xOffsetOffScreen = gridLengthPixels - (0.5 * (widthPixels % gridLengthPixels));
		var yOffsetOffScreen = gridLengthPixels - (0.5 * (heightPixels % gridLengthPixels));

		var gridsAmountX = 2 + Math.floor(widthPixels / gridLengthPixels);
		var gridsAmountY = 2 + Math.floor(heightPixels / gridLengthPixels);


		text3.value = "Grids x :" + gridsAmountX;
		text4.value = "Grids y :" + gridsAmountY;


		//Using Pixels for grids because converting each grid coordinate to latlng and comparing each data point to a
		//list of lats and lngs takes much longer than finding pixel coordinate of datapoint! (then grid is easy to find)

		var gridsXPixels = [];
		for (var xPixels = -xOffsetOffScreen; xPixels < widthPixels + gridLengthPixels; xPixels += gridLengthPixels) {
			gridsXPixels.push(xPixels);
		}
		var maxX = xPixels + gridLengthPixels;

		var gridsYPixels = [];
		for (var yPixels = -yOffsetOffScreen; yPixels < heightPixels + gridLengthPixels; yPixels += gridLengthPixels) {
			gridsYPixels.push(yPixels);
		}
		var maxY = yPixels + gridLengthPixels;

		// console.log(gridsXPixels);
		// console.log(gridsYPixels);

		//PIXELS FROM TOP LEFT


		var count = 0;
		allDataPoints.forEach(function (dataPoint) {
			count++;
			text1.value = count.toString();

			var latlng = new google.maps.LatLng(dataPoint.latlng.lat, dataPoint.latlng.lng);
			var pixelPoint = projection.fromLatLngToPoint(latlng);
			var pixelX = Math.round((pixelPoint.x - sw.x) * scale);
			var pixelY = Math.round((pixelPoint.y - ne.y) * scale);
			console.log(pixelX + ", " + pixelY);

			if ()


		});




		/*for (x = 0; x < gridsAmountX; x++) {
			var pixelsX = leftOffsetPixels + (x * gridLengthPixels);
			grids[x] = [];
			for (y = 0; y < gridsAmountY; y++) {
				var pixelsY = topOffsetPixels + (y * gridLengthPixels);
				var latlng = projection.fromPointToLatLng({x: pixelsX, y: pixelsY});
				// console.log(x + ", " + y + " --> " + pixelsX + ", " + pixelsY);
				grids[x][y] = latlng.toJSON();
			}
		}*/
		// console.log(grids);


		//Step 4: find all points in bounds
		//TODO: create grids on edge of screen - increases bounds outside of screen
		/*console.log(allDataPoints);
		allDataPoints.forEach(function(dataPoint) {
			if (bounds.contains(dataPoint.latlng)) {
			}
		});*/
	});
}