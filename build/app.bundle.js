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

var _DataVisualisationController = __webpack_require__(/*! ./DataVisualisationController */ "./DataVisualisationController.js");

function initApp() {
  var config = (0, _FirebaseCredentials.firebaseCredentials)(); //Firebase API keys
  firebase.initializeApp(config);
  var dataPointsDbRef = firebase.firestore().collection('datapoints');

  var map = initMap();

  addMapClickListener(map, dataPointsDbRef);

  getDataPointsFromDB(dataPointsDbRef, function (dataPoints) {
    (0, _DataVisualisationController.initDVController)(map, dataPoints);
  });
}

window.initApp = initApp;

function initMap() {
  return new google.maps.Map(document.getElementById('map'), {
    center: { lat: 50.9365, lng: -1.396 },
    zoom: 15,
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

function addMapClickListener(map, dataPointsDbRef) {
  map.addListener('click', function (mapLayer) {

    var dataPoint = {
      latlng: mapLayer.latLng.toJSON(),
      value: Math.floor(Math.random() * 100).toString(),
      date: new Date().toUTCString()
    };

    addNewDataPointClickToDb(dataPointsDbRef, dataPoint);
  });
}

function addNewDataPointClickToDb(dataPointsDbRef, dataPoint) {
  dataPointsDbRef.add(dataPoint).then(function (docRef) {
    console.log('Document written with ID: ', docRef.id);
  }).catch(function (error) {
    console.error('Error adding document: ', error);
  });
}

function getDataPointsFromDB(dataPointsDbRef, callback) {
  dataPointsDbRef.get().then(function (dataPoints) {
    callback(dataPoints.docs);
  });
}

//TODO: get datapoints as they are added to database

/***/ }),

/***/ "./ButtonEventHandler.js":
/*!*******************************!*\
  !*** ./ButtonEventHandler.js ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var showDataGrid = void 0;
var showDataCircles = void 0;
var showDataPoints = void 0;
var showDensityHeatmap = void 0;

var showDataGridVal = void 0;
var showDataCirclesVal = void 0;
var showDataPointsVal = void 0;
var showDensityHeatmapVal = void 0;

function initButtonEventHandler(showDataGridM, showDataCirclesM, showDataPointsM, showDensityHeatmapM) {
  showDataGrid = showDataGridM;
  showDataCircles = showDataCirclesM;
  showDataPoints = showDataPointsM;
  showDensityHeatmap = showDensityHeatmapM;

  addFormButtonListeners();
}

function addFormButtonListeners() {

  var showGridButton = document.getElementById('showGrid');
  var showPointsButton = document.getElementById('showPoints');
  var showCirclesButton = document.getElementById('showCircles');
  var showHeatmapButton = document.getElementById('showHeatmap');

  showDataGridVal = !(showGridButton.innerText === 'Show Data Grid');
  showDataPointsVal = !(showPointsButton.innerText === 'Show Data Points');
  showDataCirclesVal = !(showCirclesButton.innerText === 'Show Data Circles');
  showDensityHeatmapVal = !(showHeatmapButton.innerText === 'Show Heatmap');

  showGridButton.onclick = function () {
    styleButton(showGridButton, !showDataGridVal);
    showGridButton.innerText = showDataGridVal ? 'Show Data Grid' : 'Hide Data Grid';
    showDataGridVal = !showDataGridVal;
    showDataGrid(showDataGridVal);
  };

  showPointsButton.onclick = function () {
    styleButton(showPointsButton, !showDataPointsVal);
    showPointsButton.innerText = showDataPointsVal ? 'Show Data Points' : 'Hide Data Points';
    showDataPointsVal = !showDataPointsVal;
    showDataPoints(showDataPointsVal);
  };

  showCirclesButton.onclick = function () {
    styleButton(showCirclesButton, !showDataCirclesVal);
    showCirclesButton.innerText = showDataCirclesVal ? 'Show Data Circles' : 'Hide Data Circles';
    showDataCirclesVal = !showDataCirclesVal;
    showDataCircles(showDataCirclesVal);
  };

  showHeatmapButton.onclick = function () {
    styleButton(showHeatmapButton, !showDensityHeatmapVal);
    showHeatmapButton.innerText = showDensityHeatmapVal ? 'Show Density Heatmap' : 'Hide Density Heatmap';
    showDensityHeatmapVal = !showDensityHeatmapVal;
    showDensityHeatmap(showDensityHeatmapVal);
  };
}

function styleButton(button, highlight) {
  if (highlight) {
    button.classList.remove('btn-outline-primary');
    button.classList.add('btn-primary');
  } else {
    button.classList.remove('btn-primary');
    button.classList.add('btn-outline-primary');
  }
}

exports.initButtonEventHandler = initButtonEventHandler;

/***/ }),

/***/ "./DataVisualisationController.js":
/*!****************************************!*\
  !*** ./DataVisualisationController.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addMarkerToMap = exports.initDVController = undefined;

var _ButtonEventHandler = __webpack_require__(/*! ./ButtonEventHandler */ "./ButtonEventHandler.js");

var _GridOverlay = __webpack_require__(/*! ./GridOverlay */ "./GridOverlay.js");

var map = void 0;
var dataPoints = void 0;

var allDataPoints = [];
var dataPointMarkers = [];
var dataPointCircles = [];
var dataGrid = [];

var showDataPointMarkers = true;
var showDataCircleMarkers = false;
var showDataGridOverlay = false;
var heatmap = void 0;

function initDVController(mapObject, dataPoints) {
  allDataPoints = dataPoints.map(function (dataPoint) {
    return dataPoint.data();
  });
  map = mapObject;
  heatmap = new google.maps.visualization.HeatmapLayer({ radius: 0.005, dissipating: false });

  (0, _ButtonEventHandler.initButtonEventHandler)(showDataGrid, showDataCircles, showDataPoints, showDensityHeatmap);
  initDataCirclesPointsAndHeatmap();
  (0, _GridOverlay.initGridOverlay)(map, allDataPoints);
}

function initDataCirclesPointsAndHeatmap() {
  allDataPoints.forEach(function (dataPoint) {
    addMarkerToMap(dataPoint);
  });
}

function showDataGrid(show) {
  if (show) {
    (0, _GridOverlay.displayGrid)();
  } else {
    (0, _GridOverlay.hideDataGrid)();
  }
}

function showDataCircles(show) {
  dataPointCircles.forEach(function (dataPointCircle) {
    dataPointCircle.setVisible(show);
  });
}

function showDataPoints(show) {
  showDataPoints = show;
  dataPointMarkers.forEach(function (dataPointMarker) {
    dataPointMarker.setVisible(show);
    // dataPointMarker.setMap(show ? map : null);
  });
}

function showDensityHeatmap(show) {
  heatmap.setMap(show ? map : null);
}

function addMarkerToMap(dataPoint) {
  // todo split up
  var latlng = dataPoint.latlng;
  heatmap.getData().push(new google.maps.LatLng(latlng.lat, latlng.lng));
  var hue = (100 - dataPoint.value) * 0.6;
  var colorString = 'hsl(' + hue + ', 100%, 50%)';
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    visible: showDataPointMarkers,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      strokeColor: colorString,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: colorString,
      fillOpacity: 0.2,
      scale: 5
    }
  });

  dataPointMarkers.push(marker);

  var date = new Date(dataPoint.date);
  marker.addListener('click', function () {
    document.getElementById('date').value = date.toDateString();
    document.getElementById('time').value = date.toTimeString().split(' ')[0];
    document.getElementById('value').value = dataPoint.value;
  });

  drawCircle(latlng, map, colorString, 0.3, 50, date, dataPoint.value);
  drawCircle(latlng, map, colorString, 0.2, 100, date, dataPoint.value);
  drawCircle(latlng, map, colorString, 0.1, 200, date, dataPoint.value);
}

function drawCircle(latlng, map, colorString, opacity, radius, d1, d2) {
  var circle = new google.maps.Circle({
    strokeOpacity: 0,
    fillColor: colorString,
    fillOpacity: opacity,
    map: map,
    center: latlng,
    radius: radius,
    visible: showDataCircleMarkers
  });
  dataPointCircles.push(circle);
  circle.addListener('click', function () {
    document.getElementById('date').value = d1.toDateString();
    document.getElementById('time').value = d1.toTimeString().split(' ')[0];
    document.getElementById('value').value = d2;
  });
}

exports.initDVController = initDVController;
exports.addMarkerToMap = addMarkerToMap;

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

/***/ }),

/***/ "./GridOverlay.js":
/*!************************!*\
  !*** ./GridOverlay.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var map = void 0;
var allDataPoints = void 0;
var dataGrid = [];
var scale = void 0;
var projection = void 0;
var ne = void 0;
var sw = void 0;
var gridLengthPixels = void 0;

function initGridOverlay(mapObject, dataPoints) {
  map = mapObject;
  allDataPoints = dataPoints;
}

function hideDataGrid() {
  dataGrid.forEach(function (rectangle) {
    rectangle.setVisible(false);
  });
}

function latLngToPixels(latlng, callback) {
  var latlng2 = new google.maps.LatLng(latlng.lat, latlng.lng);
  var point = projection.fromLatLngToPoint(latlng2);
  var pixelX = Math.round((point.x - sw.x) * scale);
  var pixelY = Math.round((point.y - ne.y) * scale);
  callback(pixelX, pixelY);
}

function displayGrid() {

  //Input:
  var grids = 50; // 20 grids, end to end on smallest screen dimension

  var bounds = map.getBounds();
  projection = map.getProjection();

  ne = projection.fromLatLngToPoint(bounds.getNorthEast());
  sw = projection.fromLatLngToPoint(bounds.getSouthWest());

  scale = Math.pow(2, map.getZoom());

  var widthPixels = Math.round((ne.x - sw.x) * scale);
  var heightPixels = Math.round((sw.y - ne.y) * scale);

  // Find grid size in pixels
  gridLengthPixels = Math.round(Math.min(widthPixels, heightPixels) / grids);
  // here grids means extra grids rendered outside of screen:
  var gridsCountX = grids + Math.ceil(widthPixels / gridLengthPixels);
  var gridsCountY = grids + Math.ceil(heightPixels / gridLengthPixels);

  var borderPixelLength = grids * gridLengthPixels / 2;
  var pixelStartX = -borderPixelLength;
  var pixelStartY = -borderPixelLength;
  var pixelEndX = widthPixels + borderPixelLength;
  var pixelEndY = heightPixels + borderPixelLength;

  // Create grid - 2D array of objects: [X Position][Y Position]{}
  // and set lat lng bounds of grids
  var gridDataCollection = [];
  for (var gridX = 0; gridX < gridsCountX; gridX++) {
    gridDataCollection[gridX] = [];
    for (var gridY = 0; gridY < gridsCountY; gridY++) {
      var pixelX = -borderPixelLength + gridX * gridLengthPixels;
      var pixelY = -borderPixelLength + gridY * gridLengthPixels;
      var _bounds = gridToBounds(pixelX, pixelY);

      gridDataCollection[gridX][gridY] = {
        dataPoints: [],
        sum: null,
        count: 0,
        avgValue: null,
        blendValue: null,
        bounds: _bounds
      };
    }
  }

  // Add each data point to grid array
  allDataPoints.forEach(function (dataPoint) {
    // maybe get latLng of each grid instead - less processing?
    latLngToPixels(dataPoint.latlng, function (pixelX, pixelY) {
      if (pixelX > pixelStartX && pixelX < pixelEndX && pixelY > pixelStartY && pixelY < pixelEndY) {
        var _gridX = Math.floor((pixelX - pixelStartX) / gridLengthPixels);
        var _gridY = Math.floor((pixelY - pixelStartY) / gridLengthPixels);
        gridDataCollection[_gridX][_gridY].dataPoints.push(dataPoint.value);
      }
    });
  });

  // Get average data point value for each grid (null for no data points)
  for (var _gridX2 = 0; _gridX2 < gridsCountX; _gridX2++) {
    for (var _gridY2 = 0; _gridY2 < gridsCountY; _gridY2++) {
      var dataPoints = gridDataCollection[_gridX2][_gridY2].dataPoints;
      if (dataPoints.length > 0) {
        var sum = dataPoints.reduce(function (a, b) {
          return parseInt(a) + parseInt(b);
        });
        var avgValue = (sum / dataPoints.length).toFixed(2);
        gridDataCollection[_gridX2][_gridY2].sum = sum;
        gridDataCollection[_gridX2][_gridY2].avgValue = avgValue;
        gridDataCollection[_gridX2][_gridY2].count = dataPoints.length;
      }
    }
  }

  // Blend grid
  var blendedGridDataCollection = blendGrid(gridDataCollection);
  for (var _gridX3 = 0; _gridX3 < gridsCountX; _gridX3++) {
    for (var _gridY3 = 0; _gridY3 < gridsCountY; _gridY3++) {
      var _bounds2 = blendedGridDataCollection[_gridX3][_gridY3].bounds;
      var _avgValue = blendedGridDataCollection[_gridX3][_gridY3].avgValue;
      var blendValue = blendedGridDataCollection[_gridX3][_gridY3].blendValue;

      if (_avgValue) {
        // drawRectangle(bounds, avgValue);
      }

      if (blendValue) {
        drawRectangle(_bounds2, blendValue);
      }
    }
  }
}

function blendGrid(gridDataCollection) {
  var blendRange = 2;
  var countRequirement = 2;

  var gridsCountX = gridDataCollection.length;
  var gridsCountY = gridDataCollection[0].length;

  for (var gridX = 0; gridX < gridsCountX; gridX++) {
    for (var gridY = 0; gridY < gridsCountY; gridY++) {
      var sum = 0;
      var count = 0;

      for (var xIndex = gridX - blendRange; xIndex <= gridX + blendRange; xIndex++) {
        if (xIndex < 0 || xIndex >= gridsCountX) continue;
        for (var yIndex = gridY - blendRange; yIndex <= gridY + blendRange; yIndex++) {
          if (yIndex < 0 || yIndex >= gridsCountY) continue;

          if (gridDataCollection[xIndex][yIndex].count > 0) {
            sum += parseInt(gridDataCollection[xIndex][yIndex].sum);
            count += parseInt(gridDataCollection[xIndex][yIndex].count);
          }
        }
      }

      if (count >= countRequirement) {
        gridDataCollection[gridX][gridY].blendValue = (sum / count).toFixed(2);
      }
    }
  }
  return gridDataCollection;
}

function pixelToPoint(pixelX, pixelY) {
  return new google.maps.Point(pixelX / scale + sw.x, pixelY / scale + ne.y);
}

function gridToBounds(pixelX, pixelY) {
  var nePoint = pixelToPoint(pixelX, pixelY);
  var swPoint = pixelToPoint(pixelX + gridLengthPixels, pixelY + gridLengthPixels);
  var ne = projection.fromPointToLatLng(nePoint);
  var sw = projection.fromPointToLatLng(swPoint);

  return new google.maps.LatLngBounds(ne, sw);
}

function drawRectangle(bounds, value) {
  if (value != null) {
    var hue = (100 - value) * 0.6;
    var colorString = 'hsl(' + hue + ', 100%, 50%)';
    dataGrid.push(new google.maps.Rectangle({
      strokeWeight: 0,
      fillColor: colorString,
      fillOpacity: 0.45,
      map: map,
      bounds: bounds
    }));
  }
}

exports.initGridOverlay = initGridOverlay;
exports.hideDataGrid = hideDataGrid;
exports.displayGrid = displayGrid;

/***/ })

/******/ });
//# sourceMappingURL=app.bundle.js.map