
var allDataPoints = [];
var dataPointMarkers = [];
var dataPointCircles = [];

var showDataPoints = true;
var showDataCircles = true;
var showDataGrid = false;
var heatmap;


/**
 * Creates a map object with a click listener and a heatmap.
 */
function initApp() {
	var config = initFirebase(); //Firebase API key stuff:
	firebase.initializeApp(config);
	var dataPointsDbRef = firebase.firestore().collection('datapoints');

	var map = initMap();
	heatmap = initHeatmap(map);

	addMapClickListener(map, dataPointsDbRef);
	addDataPointDbListener(dataPointsDbRef, map);
	addFormButtonListeners(map);

}

function initMap() {
	return new google.maps.Map(document.getElementById('map'), {
		center: {lat: 50.9365, lng: -1.396},
		zoom: 16,
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
function initHeatmap() {
	return new google.maps.visualization.HeatmapLayer({radius: 0.001, dissipating: false});
}

function initFirebase() {
	return {
	};
}

function addMapClickListener(map, dataPointsDbRef) {
	map.addListener('click', function(mapLayer) {

		var dataPoint = {
			latlng: mapLayer.latLng.toJSON(),
			value: Math.floor((Math.random() * 100)).toString(),
			date: new Date().toUTCString()
		};
		allDataPoints.push(dataPoint);

		addNewDataPointClickToDb(dataPointsDbRef, dataPoint);
		addMarkerToMap(map, dataPoint);
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
	heatmap.getData().push(new google.maps.LatLng(latlng.lat, latlng.lng));
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

function addFormButtonListeners(map) {


	var viewTypeButton = document.getElementById('viewType');
	viewTypeButton.onclick = function () {
		if (viewTypeButton.innerText === 'Switch to Grid View') {
			viewTypeButton.innerText = 'Switch to Data Points View';
			hideDataPoints(true);
			hideDataCircles(true);
			hideHeatmap(true, map);

			displayGrid(map);
		} else {
			viewTypeButton.innerText = 'Switch to Grid View';
			hideDataPoints(false);
			hideDataCircles(false);
			hideHeatmap(true, map);
		}
	};

	var showPointsButton = document.getElementById('showPoints');
	showPointsButton.onclick = function () {
		if (showPointsButton.innerText === 'Show Data Points') {
			hideDataPoints(false);
		} else {
			hideDataPoints(true);
		}
	};

	var showCirclesButton = document.getElementById('showCircles');
	showCirclesButton.onclick = function () {
		if (showCirclesButton.innerText === 'Show Data Circles') {
			hideDataCircles(false);
		} else {
			hideDataCircles(true);
		}
	};

	var showHeatmapButton = document.getElementById('showHeatmap');
	showHeatmapButton.onclick = function () {
		if (showHeatmapButton.innerText === 'Show Heatmap') {
			hideHeatmap(false, map);
		} else {
			hideHeatmap(true, map);
		}
	};
}

function hideDataPoints(hidden) {
	var showPointsButton = document.getElementById('showPoints');
	if (hidden) {
		showPointsButton.innerText = 'Show Data Points';
		showPointsButton.classList.remove('btn-primary');
		showPointsButton.classList.add('btn-outline-primary');
	} else {
		showPointsButton.innerText = 'Hide Data Points';
		showPointsButton.classList.remove('btn-outline-primary');
		showPointsButton.classList.add('btn-primary');
	}
	showDataPoints = !hidden;
	dataPointMarkers.forEach(function (dataPointMarker) {
		dataPointMarker.setVisible(!hidden);
	});
}

function hideDataCircles(hidden) {
	var showCirclesButton = document.getElementById('showCircles');
	if (hidden) {
		showCirclesButton.innerText = 'Show Data Circles';
		showCirclesButton.classList.remove('btn-primary');
		showCirclesButton.classList.add('btn-outline-primary');
	} else {
		showCirclesButton.innerText = 'Hide Data Circles';
		showCirclesButton.classList.remove('btn-outline-primary');
		showCirclesButton.classList.add('btn-primary');
	}
	showDataCircles = !hidden;
	dataPointCircles.forEach(function (dataPointCircle) {
		dataPointCircle.setVisible(!hidden);
	});
}

function hideHeatmap(hidden, map) {
	var showHeatmapButton = document.getElementById('showHeatmap');
	if (hidden) {
		showHeatmapButton.innerText = 'Show Heatmap';
		showHeatmapButton.classList.remove('btn-primary');
		showHeatmapButton.classList.add('btn-outline-primary');
		heatmap.setMap(null);
	} else {
		showHeatmapButton.innerText = 'Hide Heatmap';
		showHeatmapButton.classList.remove('btn-outline-primary');
		showHeatmapButton.classList.add('btn-primary');
		heatmap.setMap(map);
	}
}

function displayGrid(map) {

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


	//Step 3: Create grid data structure
	var xOffsetOffScreen = gridLengthPixels - (0.5 * (widthPixels % gridLengthPixels));
	var yOffsetOffScreen = gridLengthPixels - (0.5 * (heightPixels % gridLengthPixels));

	var gridsAmountX = 3 + Math.round(widthPixels / gridLengthPixels);
	var gridsAmountY = 3 + Math.round(heightPixels / gridLengthPixels);


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
		gridsYPixels.push(Math.round(yPixels));
	}
	var maxY = yPixels + gridLengthPixels;

	//3D array! [X Position][Y Position][List of data in grid]
	gridDataCollection = [];
	for (var gridX=0; gridX< gridsAmountX+1; gridX++) {
		gridDataCollection[gridX] = [];
		for (var gridY=0; gridY< gridsAmountY+1; gridY++) {
			gridDataCollection[gridX][gridY] = [];
		}
	}

	allDataPoints.forEach(function (dataPoint) {
		var latlng = new google.maps.LatLng(dataPoint.latlng.lat, dataPoint.latlng.lng);
		var pixelPoint = projection.fromLatLngToPoint(latlng);
		var pixelX = Math.round((pixelPoint.x - sw.x) * scale);
		var pixelY = Math.round((pixelPoint.y - ne.y) * scale);

		if (pixelX >= -xOffsetOffScreen && pixelX < maxX
			&& pixelY >= -yOffsetOffScreen && pixelY < maxY) {
			var gridX = (pixelX / gridLengthPixels) + 1;
			var gridY = (pixelY / gridLengthPixels) + 1;
			gridDataCollection[(Math.floor(gridX))][Math.floor(gridY)].push(dataPoint.value);
		}
	});

	console.log(gridDataCollection);

	var maxGridValue = 0;
	var minGridValue = 100;
	var sumOfGridValues = 0;
	var totalGridValues = 0; //number of non-empty grids to calculate average grid value


	var gridIndexToLatLngBounds = [];

	for (gridX=0; gridX< gridsXPixels.length; gridX++) {
		gridIndexToLatLngBounds[gridX] = [];
		for (gridY=0; gridY< gridsYPixels.length; gridY++) {
			var gridBounds = pointToLatLng(projection, gridsXPixels[gridX], gridsYPixels[gridY], sw.x, ne.y, scale, gridLengthPixels);
			gridIndexToLatLngBounds[gridX][gridY] = gridBounds;

			var values = gridDataCollection[gridX][gridY];

			var count = values.length;
			if (count === 0) {
				gridDataCollection[gridX][gridY] = null;
			} else {
				var total = 0;
				for (var index=0; index<count; index++) {
					total += parseInt(gridDataCollection[gridX][gridY][index]);
				}
				var avg = (total / count).toFixed(2);
				gridDataCollection[gridX][gridY] = avg;

				if (avg > maxGridValue) {
					maxGridValue = avg;
				}
				if (avg < minGridValue) {
					maxGridValue = avg;
				}
				sumOfGridValues += parseFloat(avg);
				totalGridValues++;
			}
		}
	}

	console.log(gridIndexToLatLngBounds);
	for (gridX=0; gridX< gridsXPixels.length; gridX++) {
		for (gridY=0; gridY< gridsYPixels.length; gridY++) {
			drawRectangle(map, gridIndexToLatLngBounds[gridX][gridY], gridDataCollection[gridX][gridY]);
		}
	}
}

function pointToLatLng(projection, x, y, startX, startY, scale, gridLength) {
	var nePoint = new google.maps.Point((x/scale) + startX, (y/scale) + startY);
	var ne = projection.fromPointToLatLng(nePoint);
	var swPoint = new google.maps.Point(((x+gridLength)/scale) + startX, ((y+gridLength)/scale) + startY);
	var sw = projection.fromPointToLatLng(swPoint);

	var bounds = new google.maps.LatLngBounds(ne, sw);
	return bounds;
}

function drawRectangle(map, bounds, value) {
	var rectangle = new google.maps.Rectangle({
		strokeColor: '#FF0000',
		strokeOpacity: 0.8,
		strokeWeight: 2,
		fillColor: '#FF0000',
		fillOpacity: value/100,
		map: map,
		bounds: bounds
	});
}