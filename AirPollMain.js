import { firebaseCredentials } from './FirebaseCredentials';

let allDataPoints = [];
let dataPointMarkers = [];
let dataPointCircles = [];
let dataGrid = [];

let showDataPoints = true;
let showDataCircles = false;
let showDataGrid = false;
let heatmap;


/**
 * Creates a map object with a click listener and a heatmap.
 */
function initApp() {
  const config = firebaseCredentials(); //Firebase API keys

  firebase.initializeApp(config);
  const dataPointsDbRef = firebase.firestore().collection('datapoints');

  const map = initMap();
  heatmap = initHeatmap(map);

  addMapClickListener(map, dataPointsDbRef);
  addDataPointDbListener(dataPointsDbRef, map);
  addFormButtonListeners(map);
}

window.initApp = initApp;

function initMap() {
  return new google.maps.Map(document.getElementById('map'), {
    center: {lat: 50.9365, lng: -1.396},
    zoom: 16,
    //hide points of interest and public transport
    styles: [{
      featureType: 'poi',
      stylers: [{visibility: 'off'}],
    }, {
      featureType: 'transit.station',
      stylers: [{visibility: 'off'}],
    }],
    disableDoubleClickZoom: true,
    streetViewControl: false,
  });
}

//Heatmap is only used to show where we have data
function initHeatmap() {
  return new google.maps.visualization.HeatmapLayer({radius: 0.005, dissipating: false});
}

function addMapClickListener(map, dataPointsDbRef) {
  map.addListener('click', function (mapLayer) {

    const dataPoint = {
      latlng: mapLayer.latLng.toJSON(),
      value: Math.floor((Math.random() * 100)).toString(),
      date: new Date().toUTCString(),
    };
    allDataPoints.push(dataPoint);

    addNewDataPointClickToDb(dataPointsDbRef, dataPoint);
    addMarkerToMap(map, dataPoint);
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
      addMarkerToMap(map, dataPoint.data());
    });
  });

  //TODO: get datapoints as they are added to database
}


function addMarkerToMap(map, dataPoint) {
  const latlng = dataPoint.latlng;
  heatmap.getData().push(new google.maps.LatLng(latlng.lat, latlng.lng));
  const hue = (100 - dataPoint.value) * 0.6;
  const colorString = 'hsl(' + hue + ', 100%, 50%)';
  const marker = new google.maps.Marker({
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
      scale: 100,
    },
  });

  dataPointMarkers.push(marker);

  marker.addListener('click', function () {
    const date = new Date(dataPoint.date);
    document.getElementById('date').value = date.toDateString();
    document.getElementById('time').value = date.toTimeString().split(' ')[0];
    document.getElementById('value').value = dataPoint.value;
  });

  drawCircle(latlng, map, colorString, 0.5, 50);
  drawCircle(latlng, map, colorString, 0.3, 100);
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
      visible: showDataCircles,
    }),
  );
}

function addFormButtonListeners(map) {


  let viewTypeButton = document.getElementById('viewType');
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

  let showPointsButton = document.getElementById('showPoints');
  showPointsButton.onclick = function () {
    if (showPointsButton.innerText === 'Show Data Points') {
      hideDataPoints(false);
    } else {
      hideDataPoints(true);
    }
  };

  let showCirclesButton = document.getElementById('showCircles');
  showCirclesButton.onclick = function () {
    if (showCirclesButton.innerText === 'Show Data Circles') {
      hideDataCircles(false);
    } else {
      hideDataCircles(true);
    }
  };

  let showHeatmapButton = document.getElementById('showHeatmap');
  showHeatmapButton.onclick = function () {
    if (showHeatmapButton.innerText === 'Show Heatmap') {
      hideHeatmap(false, map);
    } else {
      hideHeatmap(true, map);
    }
  };
}

function hideDataPoints(hidden) {
  let showPointsButton = document.getElementById('showPoints');
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
  let showCirclesButton = document.getElementById('showCircles');
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
  let showHeatmapButton = document.getElementById('showHeatmap');
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

  //Step1: find biggest square (in pixels) on map
  let bounds = map.getBounds();
  let projection = map.getProjection();

  let ne = projection.fromLatLngToPoint(bounds.getNorthEast());
  let sw = projection.fromLatLngToPoint(bounds.getSouthWest());

  let scale = Math.pow(2, map.getZoom());

  let widthPixels = (ne.x - sw.x) * scale;
  let heightPixels = (sw.y - ne.y) * scale;

  let totalSquareLengthPixels = Math.min(widthPixels, heightPixels);

  //Step 2: find grid size in pixels
  let gridLengthPixels = Math.round(totalSquareLengthPixels / 20); //Eventually changeable by slider


  //Step 3: Create grid data structure
  let xOffsetOffScreen = gridLengthPixels + (0.5 * (widthPixels % gridLengthPixels));
  let yOffsetOffScreen = gridLengthPixels + (0.5 * (heightPixels % gridLengthPixels));

  let gridsAmountX = 3 + Math.round(widthPixels / gridLengthPixels);
  let gridsAmountY = 3 + Math.round(heightPixels / gridLengthPixels); //todo recalculate


  //Using Pixels for grids because converting each grid coordinate to latlng and comparing each data point to a
  //list of lats and lngs takes much longer than finding pixel coordinate of datapoint! (then grid is easy to find)

  let gridsXPixels = [];
  let xPixels;
  for (xPixels = -xOffsetOffScreen; xPixels < widthPixels + gridLengthPixels; xPixels += gridLengthPixels) {
    gridsXPixels.push(Math.round(xPixels));
  }
  let maxX = xPixels + gridLengthPixels;

  let gridsYPixels = [];
  let yPixels;
  for (yPixels = -yOffsetOffScreen; yPixels < heightPixels + gridLengthPixels; yPixels += gridLengthPixels) {
    gridsYPixels.push(Math.round(yPixels));
  }
  let maxY = yPixels + gridLengthPixels;

  //3D array! [X Position][Y Position][List of data in grid]
  let gridDataCollection = [];
  for (let gridX = 0; gridX < gridsAmountX + 1; gridX++) {
    gridDataCollection[gridX] = [];
    for (let gridY = 0; gridY < gridsAmountY + 1; gridY++) {
      gridDataCollection[gridX][gridY] = [];
    }
  }

  allDataPoints.forEach(function (dataPoint) {
    let latlng = new google.maps.LatLng(dataPoint.latlng.lat, dataPoint.latlng.lng);
    let pixelPoint = projection.fromLatLngToPoint(latlng);
    let pixelX = Math.round((pixelPoint.x - sw.x) * scale);
    let pixelY = Math.round((pixelPoint.y - ne.y) * scale);

    if (pixelX >= -xOffsetOffScreen && pixelX < maxX
      && pixelY >= -yOffsetOffScreen && pixelY < maxY) {
      let gridX = ((pixelX + xOffsetOffScreen) / gridLengthPixels);
      let gridY = ((pixelY + yOffsetOffScreen) / gridLengthPixels);
      gridDataCollection[(Math.floor(gridX))][Math.floor(gridY)].push(dataPoint.value);
    }
  });

  let maxGridValue = 0;
  let minGridValue = 100;
  let sumOfGridValues = 0;
  let totalGridValues = 0; //number of non-empty grids to calculate average grid value


  let gridIndexToLatLngBounds = [];

  for (let gridX = 0; gridX < gridsXPixels.length + 1; gridX++) {
    gridIndexToLatLngBounds[gridX] = [];
    for (let gridY = 0; gridY < gridsYPixels.length + 1; gridY++) {
      let gridBounds = pointToLatLng(projection, gridsXPixels[gridX], gridsYPixels[gridY], sw.x, ne.y, scale, gridLengthPixels);
      gridIndexToLatLngBounds[gridX][gridY] = gridBounds;

      let values = gridDataCollection[gridX][gridY];

      let count = values.length;
      if (count === 0) {
        gridDataCollection[gridX][gridY] = null;
      } else {
        let total = 0;
        for (let index = 0; index < count; index++) {
          total += parseInt(gridDataCollection[gridX][gridY][index]);
        }
        let avg = (total / count).toFixed(2);
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

  let gridBlendedDataCollection = blendGrid(gridDataCollection);

  console.log(gridBlendedDataCollection);
  for (let gridX = 0; gridX < gridsXPixels.length - 1; gridX++) {
    for (let gridY = 0; gridY < gridsYPixels.length - 1; gridY++) {
      drawRectangle(map, gridIndexToLatLngBounds[gridX + 1][gridY + 1], gridBlendedDataCollection[gridX][gridY]);
    }
  }
}

function blendGrid(gridDataCollection) {
  let gridBlendedDataCollection = [];
  for (let gridX = 1; gridX < gridDataCollection.length - 1; gridX++) {
    gridBlendedDataCollection[gridX - 1] = [];
    for (let gridY = 1; gridY < gridDataCollection[gridX].length - 1; gridY++) {
      let total = 0; // total values for grid of 3 x 3
      let count = 0;


      for (let xIndex = gridX - 1; xIndex <= gridX + 1; xIndex++) {
        for (let yIndex = gridY - 1; yIndex <= gridY + 1; yIndex++) {
          let val = gridDataCollection[xIndex][yIndex];
          if (val != null) {
            count += parseInt(1);
            total += parseFloat(val);
          }
        }
      }

      let dontShowGrid = ((count < 3) && (gridDataCollection[gridX][gridY] == null));
      if (dontShowGrid) {
        gridBlendedDataCollection[gridX - 1][gridY - 1] = null;
      } else {
        let avg = total / count;
        gridBlendedDataCollection[gridX - 1][gridY - 1] = avg;
      }
    }
  }

  return gridBlendedDataCollection;
}

function blendOperation(gridValues, x, y, count, total) {
  let val = gridValues[x][y];
  if (!isNaN(val)) {
    count += parseInt(1);
    total += parseInt(val);
  }
}

function pointToLatLng(projection, x, y, startX, startY, scale, gridLength) {
  let nePoint = new google.maps.Point((x / scale) + startX, (y / scale) + startY);
  let ne = projection.fromPointToLatLng(nePoint);
  let swPoint = new google.maps.Point(((x + gridLength) / scale) + startX, ((y + gridLength) / scale) + startY);
  let sw = projection.fromPointToLatLng(swPoint);

  let bounds = new google.maps.LatLngBounds(ne, sw);
  return bounds;
}

function drawRectangle(map, bounds, value) {
  if (value != null) {
    let hue = (100 - value) * 0.6;
    let colorString = 'hsl(' + hue + ', 100%, 50%)';
    dataGrid.push(new google.maps.Rectangle({
      strokeWeight: 0,
      fillColor: colorString,
      fillOpacity: 0.7,
      map: map,
      bounds: bounds,
    }));
  }
}