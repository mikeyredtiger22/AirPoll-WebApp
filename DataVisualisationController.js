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
      scale: 10,
    },
  });

  dataPointMarkers.push(marker);

  marker.addListener('click', function () {
    const date = new Date(dataPoint.date);
    document.getElementById('date').value = date.toDateString();
    document.getElementById('time').value = date.toTimeString().split(' ')[0];
    document.getElementById('value').value = dataPoint.value;
  });

  // drawCircle(latlng, map, colorString, 0.5, 50);
  // drawCircle(latlng, map, colorString, 0.3, 100);
  drawCircle(latlng, map, colorString, 0.1, 200);
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
      visible: showDataCircleMarkers,
    }),
  );
}

export {
  initDVController,
  addMarkerToMap,
}