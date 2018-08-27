import { initButtonEventHandler } from './ButtonEventHandler';
import { displayGrid, hideDataGrid, initGridOverlay } from './GridOverlay';

let map;
let dataPoints;

let allDataPoints = [];
let dataPointMarkers = [];
let dataPointCircles = [];
let dataGrid = [];

let showDataPointMarkers = true;
let showDataCircleMarkers = false;
let showDataGridOverlay = false;
let heatmap;

function initDVController(mapObject, dataPoints) {
  allDataPoints = dataPoints.map(dataPoint => dataPoint.data());
  map = mapObject;
  heatmap = new google.maps.visualization.HeatmapLayer({radius: 0.005, dissipating: false});

  initButtonEventHandler(showDataGrid, showDataCircles, showDataPoints, showDensityHeatmap);
  initDataCirclesPointsAndHeatmap();
  initGridOverlay(map, allDataPoints);
}

function initDataCirclesPointsAndHeatmap() {
  allDataPoints.forEach(function(dataPoint) {
    addMarkerToMap(dataPoint);
  });
}

function showDataGrid(show) {
  if (show) {
    displayGrid();
  } else {
    hideDataGrid();
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
  const latlng = dataPoint.latlng;
  heatmap.getData().push(new google.maps.LatLng(latlng.lat, latlng.lng));
  const hue = (100 - dataPoint.value) * 0.6;
  const colorString = 'hsl(' + hue + ', 100%, 50%)';
  const marker = new google.maps.Marker({
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
      scale: 5,
    },
  });

  dataPointMarkers.push(marker);

  const date = new Date(dataPoint.date);
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
  let circle = new google.maps.Circle({
    strokeOpacity: 0,
    fillColor: colorString,
    fillOpacity: opacity,
    map: map,
    center: latlng,
    radius: radius,
    visible: showDataCircleMarkers,
  });
  dataPointCircles.push(circle);
  circle.addListener('click', function () {
    document.getElementById('date').value = d1.toDateString();
    document.getElementById('time').value = d1.toTimeString().split(' ')[0];
    document.getElementById('value').value = d2;
  });
}

export {
  initDVController,
  addMarkerToMap,
}