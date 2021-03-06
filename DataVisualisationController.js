import { initButtonEventHandler } from './ButtonEventHandler';
import * as gridOverlay from './GridOverlay';

const DEFAULT_SHOW_POINTS = true;
const DEFAULT_SHOW_CIRCLES = false;
const DEFAULT_SHOW_GRID = false;
const DEFAULT_SHOW_HEATMAP = false;

let showPoints = DEFAULT_SHOW_POINTS;
let showCircles = DEFAULT_SHOW_CIRCLES;
let showGrid = DEFAULT_SHOW_GRID;
let showHeatmap = DEFAULT_SHOW_HEATMAP;

let map;
let dataPointMarkers = [];
let dataPointCircles = [];
let heatmap;

let filteredDataPointListener = {
  resetDataPoints: resetFilteredDataPoints,
  addDataPoint: addFilteredDataPoint
};

function initDVController(mapObject) {
  map = mapObject;
  initDataVisualisations();
  initButtonEventHandler(setShowDataGrid, setShowDataCircles, setShowDataPoints, setShowDensityHeatmap);
}

function initDataVisualisations() {
  gridOverlay.initGridOverlay(map);
  if (showGrid) {
    gridOverlay.displayGridWhenReady();
  }
  const heatmapOptions = {radius: 0.005, dissipating: false, map: showHeatmap ? map : null};
  heatmap = new google.maps.visualization.HeatmapLayer(heatmapOptions);
}

function resetFilteredDataPoints() {
  // Reset markers
  dataPointMarkers.forEach(function (marker) {
    marker.setMap(null);
  });
  dataPointMarkers = [];

  // Reset circles
  dataPointCircles.forEach(function (circle) {
    circle.setMap(null);
  });
  dataPointMarkers = [];

  // Reset heatmap
  heatmap.setData([]);

  // Reset grid
  gridOverlay.resetDataPoints();
}

function addFilteredDataPoint(dataPoint) {
  dataPoint.latlng = new google.maps.LatLng(dataPoint.lat, dataPoint.lng);
  createMarker(dataPoint);
  createCircle(dataPoint);
  addDataPointToHeatmap(dataPoint);
  gridOverlay.addFilteredDataPointToGrid(dataPoint);
}

function addDataPointToHeatmap(dataPoint) {
  if (dataPoint.latlng) {
    heatmap.getData().push(dataPoint.latlng);
  }
}

function createMarker(dataPoint) {
  const hue = (100 - dataPoint.value) * 0.6;
  const colorString = 'hsl(' + hue + ', 100%, 50%)';
  const marker = new google.maps.Marker({
    position: dataPoint.latlng,
    map: map,
    visible: showPoints,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      strokeColor: colorString,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: colorString,
      fillOpacity: 0.2,
      scale: 5,
    },
  });

  addDataPointClickListener(marker, dataPoint.timestamp, dataPoint.value);
  dataPointMarkers.push(marker);
}

function createCircle(dataPoint) {
  const hue = (100 - dataPoint.value) * 0.6;
  const colorString = 'hsl(' + hue + ', 100%, 50%)';
  const date = new Date(dataPoint.date);
  // Only add click listener to inner-most circle
  drawCircle(dataPoint.latlng, map, colorString, 0.3, 50, date, dataPoint.value, true);
  drawCircle(dataPoint.latlng, map, colorString, 0.2, 100, date, dataPoint.value);
  drawCircle(dataPoint.latlng, map, colorString, 0.1, 200, date, dataPoint.value);
}

function drawCircle(latlng, map, colorString, opacity, radius, date, value, addListener = false) {
  let circle = new google.maps.Circle({
    strokeOpacity: 0,
    fillColor: colorString,
    fillOpacity: opacity,
    map: map,
    center: latlng,
    radius: radius,
    visible: showCircles,
  });

  dataPointCircles.push(circle);
  if (addListener) {
    addDataPointClickListener(circle, date, value);
  }
}

function addDataPointClickListener(view, date, value) {
  const dateObj = new Date(date);
  view.addListener('click', function () {
    document.getElementById('date').value = dateObj.toDateString();
    document.getElementById('time').value = dateObj.toTimeString().split(' ')[0];
    document.getElementById('value').value = value;
  });
}

function setShowDataGrid(show) {
  showGrid = show;
  if (show) {
    gridOverlay.displayGridWhenReady();
  } else {
    gridOverlay.hideDataGrid();
  }
}

function setShowDataCircles(show) {
  showCircles = show;
  dataPointCircles.forEach(function (dataPointCircle) {
    dataPointCircle.setVisible(show);
  });
}

function setShowDataPoints(show) {
  showPoints = show;
  dataPointMarkers.forEach(function (dataPointMarker) {
    dataPointMarker.setVisible(show);
  });
}

function setShowDensityHeatmap(show) {
  showHeatmap = show;
  heatmap.setMap(show ? map : null);
}

export {
  initDVController,
  filteredDataPointListener
};
