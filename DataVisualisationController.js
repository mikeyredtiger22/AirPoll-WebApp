import { initButtonEventHandler } from './ButtonEventHandler';
import { displayGrid, hideDataGrid, initGridOverlay, addFilteredDataPointToGrid } from './GridOverlay';

let map;
let dataPointMarkers = [];
let dataPointCircles = [];
let heatmap;

function initDVController(mapObject) {
  map = mapObject;
  heatmap = new google.maps.visualization.HeatmapLayer({radius: 0.005, dissipating: false});
  initGridOverlay(mapObject);
  initButtonEventHandler(showDataGrid, showDataCircles, showDataPoints, showDensityHeatmap);
}

function addFilteredDataPoint(dataPoint) {
  dataPoint.latlng = new google.maps.LatLng(dataPoint.lat, dataPoint.lng);
  // todo show DV if set to show instead of using default start variables
  createMarker(dataPoint);
  createCircle(dataPoint);
  addDataPointToHeatmap(dataPoint);
  addFilteredDataPointToGrid(dataPoint);
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
  });
}

function showDensityHeatmap(show) {
  heatmap.setMap(show ? map : null);
}

export {
  addFilteredDataPoint,
  initDVController,
};