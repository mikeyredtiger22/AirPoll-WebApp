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

var allDataPoints = [];
// import { addFormButtonListeners } from './ButtonEventHandler';

var dataPointMarkers = [];
var dataPointCircles = [];
var dataGrid = [];

var showDataPoints = true;
var showDataCircles = false;
var showDataGrid = false;
var heatmap = void 0;

/**
 * Creates a map object with a click listener and a heatmap.
 */
function initApp() {
  var config = (0, _FirebaseCredentials.firebaseCredentials)(); //Firebase API keys
  firebase.initializeApp(config);
  var dataPointsDbRef = firebase.firestore().collection('datapoints');

  var map = initMap();
  heatmap = initHeatmap(map);

  // addMapClickListener(map, dataPointsDbRef);
  addDataPointDbListener(dataPointsDbRef, map);
  // addFormButtonListeners(map);
  (0, _DataVisualisationController.initDVController)(map);
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
    (0, _DataVisualisationController.addMarkerToMap)(map, dataPoint);
  });
}

function addNewDataPointClickToDb(dataPointsDbRef, dataPoint) {
  dataPointsDbRef.add(dataPoint).then(function (docRef) {
    console.log('Document written with ID: ', docRef.id);
  }).catch(function (error) {
    console.error('Error adding document: ', error);
  });
}

function addDataPointDbListener(dataPointsDbRef, map) {
  dataPointsDbRef.get().then(function (dataPoints) {
    dataPoints.forEach(function (dataPoint) {
      allDataPoints.push(dataPoint.data());
      (0, _DataVisualisationController.addMarkerToMap)(map, dataPoint.data());
    });
  });

  //TODO: get datapoints as they are added to database
}

// function hideDataGrid(hidden) {
//   dataGrid.forEach(function (rectangle) {
//     rectangle.setVisible(!hidden);
//   });
// }
//
// function displayGrid(map) {
//   dataGrid = [];
//
//   //Step1: find biggest square (in pixels) on map
//   let bounds = map.getBounds();
//   let projection = map.getProjection();
//
//   let ne = projection.fromLatLngToPoint(bounds.getNorthEast());
//   let sw = projection.fromLatLngToPoint(bounds.getSouthWest());
//
//   let scale = Math.pow(2, map.getZoom());
//
//   let widthPixels = (ne.x - sw.x) * scale;
//   let heightPixels = (sw.y - ne.y) * scale;
//
//   let totalSquareLengthPixels = Math.min(widthPixels, heightPixels);
//
//   //Step 2: find grid size in pixels
//   let gridLengthPixels = Math.round(totalSquareLengthPixels / 20); //Eventually changeable by slider
//
//
//   //Step 3: Create grid data structure
//   let xOffsetOffScreen = gridLengthPixels + (0.5 * (widthPixels % gridLengthPixels));
//   let yOffsetOffScreen = gridLengthPixels + (0.5 * (heightPixels % gridLengthPixels));
//
//   let gridsAmountX = 3 + Math.round(widthPixels / gridLengthPixels);
//   let gridsAmountY = 3 + Math.round(heightPixels / gridLengthPixels); //todo recalculate
//
//
//   //Using Pixels for grids because converting each grid coordinate to latlng and comparing each data point to a
//   //list of lats and lngs takes much longer than finding pixel coordinate of datapoint! (then grid is easy to find)
//
//   let gridsXPixels = [];
//   let xPixels;
//   for (xPixels = -xOffsetOffScreen; xPixels < widthPixels + gridLengthPixels; xPixels += gridLengthPixels) {
//     gridsXPixels.push(Math.round(xPixels));
//   }
//   let maxX = xPixels + gridLengthPixels;
//
//   let gridsYPixels = [];
//   let yPixels;
//   for (yPixels = -yOffsetOffScreen; yPixels < heightPixels + gridLengthPixels; yPixels += gridLengthPixels) {
//     gridsYPixels.push(Math.round(yPixels));
//   }
//   let maxY = yPixels + gridLengthPixels;
//
//   //3D array! [X Position][Y Position][List of data in grid]
//   let gridDataCollection = [];
//   for (let gridX = 0; gridX < gridsAmountX + 1; gridX++) {
//     gridDataCollection[gridX] = [];
//     for (let gridY = 0; gridY < gridsAmountY + 1; gridY++) {
//       gridDataCollection[gridX][gridY] = [];
//     }
//   }
//
//   allDataPoints.forEach(function (dataPoint) {
//     let latlng = new google.maps.LatLng(dataPoint.latlng.lat, dataPoint.latlng.lng);
//     let pixelPoint = projection.fromLatLngToPoint(latlng);
//     let pixelX = Math.round((pixelPoint.x - sw.x) * scale);
//     let pixelY = Math.round((pixelPoint.y - ne.y) * scale);
//
//     if (pixelX >= -xOffsetOffScreen && pixelX < maxX
//       && pixelY >= -yOffsetOffScreen && pixelY < maxY) {
//       let gridX = ((pixelX + xOffsetOffScreen) / gridLengthPixels);
//       let gridY = ((pixelY + yOffsetOffScreen) / gridLengthPixels);
//       gridDataCollection[(Math.floor(gridX))][Math.floor(gridY)].push(dataPoint.value);
//     }
//   });
//
//   let maxGridValue = 0;
//   let minGridValue = 100;
//   let sumOfGridValues = 0;
//   let totalGridValues = 0; //number of non-empty grids to calculate average grid value
//
//
//   let gridIndexToLatLngBounds = [];
//
//   for (let gridX = 0; gridX < gridsXPixels.length + 1; gridX++) {
//     gridIndexToLatLngBounds[gridX] = [];
//     for (let gridY = 0; gridY < gridsYPixels.length + 1; gridY++) {
//       let gridBounds = pointToLatLng(projection, gridsXPixels[gridX], gridsYPixels[gridY], sw.x, ne.y, scale, gridLengthPixels);
//       gridIndexToLatLngBounds[gridX][gridY] = gridBounds;
//
//       let values = gridDataCollection[gridX][gridY];
//
//       let count = values.length;
//       if (count === 0) {
//         gridDataCollection[gridX][gridY] = null;
//       } else {
//         let total = 0;
//         for (let index = 0; index < count; index++) {
//           total += parseInt(gridDataCollection[gridX][gridY][index]);
//         }
//         let avg = (total / count).toFixed(2);
//         gridDataCollection[gridX][gridY] = avg;
//
//         if (avg > maxGridValue) {
//           maxGridValue = avg;
//         }
//         if (avg < minGridValue) {
//           maxGridValue = avg;
//         }
//         sumOfGridValues += parseFloat(avg);
//         totalGridValues++;
//       }
//     }
//   }
//
//   // console.log(gridDataCollection);
//
//   /*for (gridX=0; gridX< gridsXPixels.length + 1; gridX++) {
//     for (gridY=0; gridY< gridsYPixels.length + 1; gridY++) {
//       drawRectangle(map, gridIndexToLatLngBounds[gridX][gridY], gridDataCollection[gridX][gridY]);
//     }
//   }*/
//
//   let gridBlendedDataCollection = blendGrid(gridDataCollection);
//
//   console.log(gridBlendedDataCollection);
//   for (let gridX = 0; gridX < gridsXPixels.length - 1; gridX++) {
//     for (let gridY = 0; gridY < gridsYPixels.length - 1; gridY++) {
//       drawRectangle(map, gridIndexToLatLngBounds[gridX + 1][gridY + 1], gridBlendedDataCollection[gridX][gridY]);
//     }
//   }
// }
//
// function blendGrid(gridDataCollection) {
//   let gridBlendedDataCollection = [];
//   for (let gridX = 1; gridX < gridDataCollection.length - 1; gridX++) {
//     gridBlendedDataCollection[gridX - 1] = [];
//     for (let gridY = 1; gridY < gridDataCollection[gridX].length - 1; gridY++) {
//       let total = 0; // total values for grid of 3 x 3
//       let count = 0;
//
//
//       for (let xIndex = gridX - 1; xIndex <= gridX + 1; xIndex++) {
//         for (let yIndex = gridY - 1; yIndex <= gridY + 1; yIndex++) {
//           let val = gridDataCollection[xIndex][yIndex];
//           if (val != null) {
//             count += parseInt(1);
//             total += parseFloat(val);
//           }
//         }
//       }
//
//       let dontShowGrid = ((count < 3) && (gridDataCollection[gridX][gridY] == null));
//       if (dontShowGrid) {
//         gridBlendedDataCollection[gridX - 1][gridY - 1] = null;
//       } else {
//         let avg = total / count;
//         gridBlendedDataCollection[gridX - 1][gridY - 1] = avg;
//       }
//     }
//   }
//
//   return gridBlendedDataCollection;
// }
//
// function blendOperation(gridValues, x, y, count, total) {
//   let val = gridValues[x][y];
//   if (!isNaN(val)) {
//     count += parseInt(1);
//     total += parseInt(val);
//   }
// }
//
// function pointToLatLng(projection, x, y, startX, startY, scale, gridLength) {
//   let nePoint = new google.maps.Point((x / scale) + startX, (y / scale) + startY);
//   let ne = projection.fromPointToLatLng(nePoint);
//   let swPoint = new google.maps.Point(((x + gridLength) / scale) + startX, ((y + gridLength) / scale) + startY);
//   let sw = projection.fromPointToLatLng(swPoint);
//
//   let bounds = new google.maps.LatLngBounds(ne, sw);
//   return bounds;
// }
//
// function drawRectangle(map, bounds, value) {
//   if (value != null) {
//     let hue = (100 - value) * 0.6;
//     let colorString = 'hsl(' + hue + ', 100%, 50%)';
//     dataGrid.push(new google.maps.Rectangle({
//       strokeWeight: 0,
//       fillColor: colorString,
//       fillOpacity: 0.7,
//       map: map,
//       bounds: bounds,
//     }));
//   }
// }

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
    if (showDataPointsVal) {
      showPointsButton.innerText = 'Show Data Points';
      showPointsButton.classList.remove('btn-primary');
      showPointsButton.classList.add('btn-outline-primary');
    } else {
      showPointsButton.innerText = 'Hide Data Points';
      showPointsButton.classList.remove('btn-outline-primary');
      showPointsButton.classList.add('btn-primary');
    }
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
    if (showDensityHeatmapVal) {
      showHeatmapButton.innerText = 'Show Heatmap';
      showHeatmapButton.classList.remove('btn-primary');
      showHeatmapButton.classList.add('btn-outline-primary');
    } else {
      showHeatmapButton.innerText = 'Hide Heatmap';
      showHeatmapButton.classList.remove('btn-outline-primary');
      showHeatmapButton.classList.add('btn-primary');
    }
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

function initDVController(mapObject) {
  map = mapObject;
  heatmap = new google.maps.visualization.HeatmapLayer({ radius: 0.005, dissipating: false });
  (0, _ButtonEventHandler.initButtonEventHandler)(showDataGrid, showDataCircles, showDataPoints, showDensityHeatmap);
}

function showDataGrid(show) {
  // dataGrid.forEach(function (rectangle) {
  //   rectangle.setVisible(show);
  // });
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
  });
}

function showDensityHeatmap(show) {
  heatmap.setMap(show ? map : null);
}

function addMarkerToMap(map, dataPoint) {
  var latlng = dataPoint.latlng;
  heatmap.getData().push(new google.maps.LatLng(latlng.lat, latlng.lng));
  var hue = (100 - dataPoint.value) * 0.6;
  var colorString = 'hsl(' + hue + ', 100%, 50%)';
  var marker = new google.maps.Marker({
    position: latlng,
    label: dataPoint.value.toString(),
    map: map,
    visible: showDataPointMarkers,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      strokeColor: colorString,
      strokeOpacity: 0,
      strokeWeight: 1,
      fillColor: colorString,
      fillOpacity: 0,
      scale: 10
    }
  });

  dataPointMarkers.push(marker);

  marker.addListener('click', function () {
    var date = new Date(dataPoint.date);
    document.getElementById('date').value = date.toDateString();
    document.getElementById('time').value = date.toTimeString().split(' ')[0];
    document.getElementById('value').value = dataPoint.value;
  });

  // drawCircle(latlng, map, colorString, 0.5, 50);
  // drawCircle(latlng, map, colorString, 0.3, 100);
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
    visible: showDataCircleMarkers
  }));
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

/***/ })

/******/ });
//# sourceMappingURL=app.bundle.js.map