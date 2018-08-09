/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./AirPollMain.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./AirPollMain.js":
/*!************************!*\
  !*** ./AirPollMain.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _FirebaseCredentials = __webpack_require__(/*! ./FirebaseCredentials */ "./FirebaseCredentials.js");

var allDataPoints = [];
var dataPointMarkers = [];
var dataPointCircles = [];
var dataGrid = [];

var showDataPoints = false;
var showDataCircles = false;
var showDataGrid = false;
var heatmap;

/**
 * Creates a map object with a click listener and a heatmap.
 */
function initApp() {
	var config = (0, _FirebaseCredentials.firebaseCredentials)(); //Firebase API keys

	firebase.initializeApp(config);
	var dataPointsDbRef = firebase.firestore().collection('datapoints');

	var map = initMap();
	heatmap = initHeatmap(map);

	addMapClickListener(map, dataPointsDbRef);
	addDataPointDbListener(dataPointsDbRef, map);
	addFormButtonListeners(map);
}

window.initApp = initApp;

function initMap() {
	return new google.maps.Map(document.getElementById('map'), {
		center: { lat: 50.9365, lng: -1.396 },
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
	return new google.maps.visualization.HeatmapLayer({ radius: 0.005, dissipating: false });
}

function addMapClickListener(map, dataPointsDbRef) {
	map.addListener('click', function (mapLayer) {

		var dataPoint = {
			latlng: mapLayer.latLng.toJSON(),
			value: Math.floor(Math.random() * 100).toString(),
			date: new Date().toUTCString()
		};
		allDataPoints.push(dataPoint);

		addNewDataPointClickToDb(dataPointsDbRef, dataPoint);
		addMarkerToMap(map, dataPoint);
	});
}

function addNewDataPointClickToDb(dataPointsDbRef, dataPoint) {
	dataPointsDbRef.add(dataPoint).then(function (docRef) {
		console.log("Document written with ID: ", docRef.id);
	}).catch(function (error) {
		console.error("Error adding document: ", error);
	});
}

function addDataPointDbListener(dataPointsDbRef, map) {
	dataPointsDbRef.get().then(function (dataPoints) {
		dataPoints.forEach(function (dataPoint) {
			allDataPoints.push(dataPoint.data());
			addMarkerToMap(map, dataPoint.data());
		});
	});

	//TODO: get datapoints as they are added to database
}

function addMarkerToMap(map, dataPoint) {
	var latlng = dataPoint.latlng;
	heatmap.getData().push(new google.maps.LatLng(latlng.lat, latlng.lng));
	var hue = (100 - dataPoint.value) * 0.6;
	var colorString = "hsl(" + hue + ", 100%, 50%)";
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

	marker.addListener('click', function () {
		var date = new Date(dataPoint.date);
		document.getElementById('date').value = date.toDateString();
		document.getElementById('time').value = date.toTimeString().split(' ')[0];
		document.getElementById('value').value = dataPoint.value;
	});

	drawCircle(latlng, map, colorString, 0.5, 50);
	drawCircle(latlng, map, colorString, 0.3, 100);
	drawCircle(latlng, map, colorString, 0.1, 200);
}

function drawCircle(latlng, map, colorString, opacity, radius) {
	dataPointCircles.push(new google.maps.Circle({
		strokeOpacity: 0,
		fillColor: colorString,
		fillOpacity: opacity,
		map: map,
		center: latlng,
		radius: radius,
		visible: showDataCircles
	}));
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
			hideDataGrid(true);
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

function hideDataGrid(hidden) {
	dataGrid.forEach(function (rectangle) {
		rectangle.setVisible(!hidden);
	});
}

function displayGrid(map) {
	dataGrid = [];

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
	var gridLengthPixels = Math.round(totalSquareLengthPixels / 20); //Eventually changeable by slider


	//Step 3: Create grid data structure
	var xOffsetOffScreen = gridLengthPixels + 0.5 * (widthPixels % gridLengthPixels);
	var yOffsetOffScreen = gridLengthPixels + 0.5 * (heightPixels % gridLengthPixels);

	var gridsAmountX = 3 + Math.round(widthPixels / gridLengthPixels);
	var gridsAmountY = 3 + Math.round(heightPixels / gridLengthPixels); //todo recalculate


	//Using Pixels for grids because converting each grid coordinate to latlng and comparing each data point to a
	//list of lats and lngs takes much longer than finding pixel coordinate of datapoint! (then grid is easy to find)

	var gridsXPixels = [];
	for (var xPixels = -xOffsetOffScreen; xPixels < widthPixels + gridLengthPixels; xPixels += gridLengthPixels) {
		gridsXPixels.push(Math.round(xPixels));
	}
	var maxX = xPixels + gridLengthPixels;

	var gridsYPixels = [];
	for (var yPixels = -yOffsetOffScreen; yPixels < heightPixels + gridLengthPixels; yPixels += gridLengthPixels) {
		gridsYPixels.push(Math.round(yPixels));
	}
	var maxY = yPixels + gridLengthPixels;

	//3D array! [X Position][Y Position][List of data in grid]
	var gridDataCollection = [];
	for (var gridX = 0; gridX < gridsAmountX + 1; gridX++) {
		gridDataCollection[gridX] = [];
		for (var gridY = 0; gridY < gridsAmountY + 1; gridY++) {
			gridDataCollection[gridX][gridY] = [];
		}
	}

	allDataPoints.forEach(function (dataPoint) {
		var latlng = new google.maps.LatLng(dataPoint.latlng.lat, dataPoint.latlng.lng);
		var pixelPoint = projection.fromLatLngToPoint(latlng);
		var pixelX = Math.round((pixelPoint.x - sw.x) * scale);
		var pixelY = Math.round((pixelPoint.y - ne.y) * scale);

		if (pixelX >= -xOffsetOffScreen && pixelX < maxX && pixelY >= -yOffsetOffScreen && pixelY < maxY) {
			var gridX = (pixelX + xOffsetOffScreen) / gridLengthPixels;
			var gridY = (pixelY + yOffsetOffScreen) / gridLengthPixels;
			gridDataCollection[Math.floor(gridX)][Math.floor(gridY)].push(dataPoint.value);
		}
	});

	var maxGridValue = 0;
	var minGridValue = 100;
	var sumOfGridValues = 0;
	var totalGridValues = 0; //number of non-empty grids to calculate average grid value


	var gridIndexToLatLngBounds = [];

	for (gridX = 0; gridX < gridsXPixels.length + 1; gridX++) {
		gridIndexToLatLngBounds[gridX] = [];
		for (gridY = 0; gridY < gridsYPixels.length + 1; gridY++) {
			var gridBounds = pointToLatLng(projection, gridsXPixels[gridX], gridsYPixels[gridY], sw.x, ne.y, scale, gridLengthPixels);
			gridIndexToLatLngBounds[gridX][gridY] = gridBounds;

			var values = gridDataCollection[gridX][gridY];

			var count = values.length;
			if (count === 0) {
				gridDataCollection[gridX][gridY] = null;
			} else {
				var total = 0;
				for (var index = 0; index < count; index++) {
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

	// console.log(gridDataCollection);

	/*for (gridX=0; gridX< gridsXPixels.length + 1; gridX++) {
 	for (gridY=0; gridY< gridsYPixels.length + 1; gridY++) {
 		drawRectangle(map, gridIndexToLatLngBounds[gridX][gridY], gridDataCollection[gridX][gridY]);
 	}
 }*/

	var gridBlendedDataCollection = blendGrid(gridDataCollection);

	console.log(gridBlendedDataCollection);
	for (gridX = 0; gridX < gridsXPixels.length - 1; gridX++) {
		for (gridY = 0; gridY < gridsYPixels.length - 1; gridY++) {
			drawRectangle(map, gridIndexToLatLngBounds[gridX + 1][gridY + 1], gridBlendedDataCollection[gridX][gridY]);
		}
	}
}

function blendGrid(gridDataCollection) {
	var gridBlendedDataCollection = [];
	for (var gridX = 1; gridX < gridDataCollection.length - 1; gridX++) {
		gridBlendedDataCollection[gridX - 1] = [];
		for (var gridY = 1; gridY < gridDataCollection[gridX].length - 1; gridY++) {
			var total = 0; // total values for grid of 3 x 3
			var count = 0;

			for (var xIndex = gridX - 1; xIndex <= gridX + 1; xIndex++) {
				for (var yIndex = gridY - 1; yIndex <= gridY + 1; yIndex++) {
					var val = gridDataCollection[xIndex][yIndex];
					if (val != null) {
						count += parseInt(1);
						total += parseFloat(val);
					}
				}
			}

			var dontShowGrid = count < 3 && gridDataCollection[gridX][gridY] == null;
			if (dontShowGrid) {
				gridBlendedDataCollection[gridX - 1][gridY - 1] = null;
			} else {
				var avg = total / count;
				gridBlendedDataCollection[gridX - 1][gridY - 1] = avg;
			}
		}
	}

	return gridBlendedDataCollection;
}

function blendOperation(gridValues, x, y, count, total) {
	var val = gridValues[x][y];
	if (!isNaN(val)) {
		count += parseInt(1);
		total += parseInt(val);
	}
}

function pointToLatLng(projection, x, y, startX, startY, scale, gridLength) {
	var nePoint = new google.maps.Point(x / scale + startX, y / scale + startY);
	var ne = projection.fromPointToLatLng(nePoint);
	var swPoint = new google.maps.Point((x + gridLength) / scale + startX, (y + gridLength) / scale + startY);
	var sw = projection.fromPointToLatLng(swPoint);

	var bounds = new google.maps.LatLngBounds(ne, sw);
	return bounds;
}

function drawRectangle(map, bounds, value) {
	if (value != null) {
		var hue = (100 - value) * 0.6;
		var colorString = "hsl(" + hue + ", 100%, 50%)";
		dataGrid.push(new google.maps.Rectangle({
			strokeWeight: 0,
			fillColor: colorString,
			fillOpacity: 0.7,
			map: map,
			bounds: bounds
		}));
	}
}

/***/ }),

/***/ "./FirebaseCredentials.js":
/*!********************************!*\
  !*** ./FirebaseCredentials.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.firebaseCredentials = firebaseCredentials;
function firebaseCredentials() {
  return {
    apiKey: "AIzaSyCTY-5_e4vfG_hURD10OVQ-wOkkiBQpZlI",
    authDomain: "airpoll-830fa.firebaseapp.com",
    databaseURL: "https://airpoll-830fa.firebaseio.com",
    projectId: "airpoll-830fa",
    storageBucket: "airpoll-830fa.appspot.com",
    messagingSenderId: "512203516382"
  };
}

/***/ })

/******/ });
//# sourceMappingURL=app.bundle.js.map