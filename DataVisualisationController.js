import { initButtonEventHandler } from './ButtonEventHandler';
import { displayGrid, hideDataGrid, initGridOverlay } from './GridOverlay';

let map;
let allDataPoints = [];
let dataPointMarkers = [];
let dataPointCircles = [];
let heatmap;

function initDVController(mapObject, dataPoints) {
  map = mapObject;
  allDataPoints = dataPoints.map(dataPoint => dataPoint.data());
  allDataPoints.forEach(dataPoint => {
    dataPoint.latlng = new google.maps.LatLng(dataPoint.lat, dataPoint.lng);
  });

  initButtonEventHandler(showDataGrid, showDataCircles, showDataPoints, showDensityHeatmap);
  createMarkers();
  createCircles();
  createHeatmap();

  initGridOverlay(map, allDataPoints);
}

function createMarkers() {
  allDataPoints.forEach(function (dataPoint) {
    const hue = (100 - dataPoint.value) * 0.6;
    const colorString = 'hsl(' + hue + ', 100%, 50%)';
    const marker = new google.maps.Marker({
      position: dataPoint.latlng,
      map: map,
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

    addDataPointClickListener(marker, dataPoint.date, dataPoint.value);
    dataPointMarkers.push(marker);
  });
}

function createHeatmap() {
  heatmap = new google.maps.visualization.HeatmapLayer({radius: 0.005, dissipating: false});
  allDataPoints.forEach(function (dataPoint) {
    heatmap.getData().push(dataPoint.latlng);
  });
}

function createCircles() {
  allDataPoints.forEach(function (dataPoint) {
    const latlng = dataPoint.latlng;
    const hue = (100 - dataPoint.value) * 0.6;
    const colorString = 'hsl(' + hue + ', 100%, 50%)';
    const date = new Date(dataPoint.date);
    // Only add click listener to inner-most circle
    drawCircle(latlng, map, colorString, 0.3, 50, date, dataPoint.value, true);
    drawCircle(latlng, map, colorString, 0.2, 100, date, dataPoint.value);
    drawCircle(latlng, map, colorString, 0.1, 200, date, dataPoint.value);
  });
}

function drawCircle(latlng, map, colorString, opacity, radius, date, value, addListener = false) {
  let circle = new google.maps.Circle({
    strokeOpacity: 0,
    fillColor: colorString,
    fillOpacity: opacity,
    map: map,
    center: latlng,
    radius: radius,
    visible: false,
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

export {
  initDVController,
};