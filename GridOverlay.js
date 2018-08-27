let map;
let allDataPoints;
let dataGrid = [];
let scale;
let projection;
let ne;
let sw;
let gridLengthPixels;

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
  let latlng2 = new google.maps.LatLng(latlng.lat, latlng.lng);
  let point = projection.fromLatLngToPoint(latlng2);
  let pixelX = Math.round((point.x - sw.x) * scale);
  let pixelY = Math.round((point.y - ne.y) * scale);
  callback(pixelX, pixelY);
}

function displayGrid() {

  //Input:
  let grids = 20; // 20 grids, end to end on smallest screen dimension

  let bounds = map.getBounds();
  projection = map.getProjection();

  ne = projection.fromLatLngToPoint(bounds.getNorthEast());
  sw = projection.fromLatLngToPoint(bounds.getSouthWest());

  scale = Math.pow(2, map.getZoom());

  let widthPixels = Math.round((ne.x - sw.x) * scale);
  let heightPixels = Math.round((sw.y - ne.y) * scale);

  // Find grid size in pixels
  gridLengthPixels = Math.round(Math.min(widthPixels, heightPixels) / grids);
  // here grids means extra grids rendered outside of screen:
  let gridsCountX = grids + Math.ceil(widthPixels / gridLengthPixels);
  let gridsCountY = grids + Math.ceil(heightPixels / gridLengthPixels);
  console.log(gridsCountY);

  let borderPixelLength = (grids * gridLengthPixels) / 2;
  let pixelStartX = - borderPixelLength;
  let pixelStartY = - borderPixelLength;
  let pixelEndX = widthPixels + borderPixelLength;
  let pixelEndY = heightPixels + borderPixelLength;

  // Create grid - 2D array of objects: [X Position][Y Position]{}
  // and set lat lng bounds of grids
  let gridDataCollection = [];
  for (let gridX = 0; gridX < gridsCountX; gridX++) {
    gridDataCollection[gridX] = [];
    for (let gridY = 0; gridY < gridsCountY; gridY++) {
      let pixelX = (- borderPixelLength) + (gridX * gridLengthPixels);
      let pixelY = (- borderPixelLength) + (gridY * gridLengthPixels);
      let bounds = gridToBounds(pixelX, pixelY);

      gridDataCollection[gridX][gridY] = {
        dataPoints: [],
        avgValue: null,
        count: 0,
        bounds: bounds,
      };
    }
  }

  // Add each data point to grid array
  allDataPoints.forEach(function (dataPoint) {
    // maybe get latLng of each grid instead - less processing?
    latLngToPixels(dataPoint.latlng, function (pixelX, pixelY) {
      if (
        pixelX > pixelStartX &&
        pixelX < pixelEndX &&
        pixelY > pixelStartY &&
        pixelY < pixelEndY
      ) {
        let gridX = Math.floor((pixelX - pixelStartX) / gridLengthPixels);
        let gridY = Math.floor((pixelY - pixelStartY) / gridLengthPixels);
        gridDataCollection[gridX][gridY].dataPoints.push(dataPoint.value);
      }
    });
  });

  // Get average data point value for each grid (null for no data points)
  for (let gridX = 0; gridX < gridsCountX; gridX++) {
    for (let gridY = 0; gridY < gridsCountY; gridY++) {
      let dataPoints = gridDataCollection[gridX][gridY].dataPoints;
      if (dataPoints.length > 0) {
        let sum = dataPoints.reduce(function (a, b) {return parseInt(a) + parseInt(b);});
        let average = sum / dataPoints.length;
        gridDataCollection[gridX][gridY].avgValue = average;
        gridDataCollection[gridX][gridY].count = dataPoints.length;

        let bounds = gridDataCollection[gridX][gridY].bounds;

        drawRectangle(bounds, average);
      }
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

function pixelToPoint(pixelX, pixelY) {
  return new google.maps.Point((pixelX / scale) + sw.x, (pixelY / scale) + ne.y);
}

function gridToBounds(pixelX, pixelY) {
  let nePoint = pixelToPoint(pixelX, pixelY);
  let swPoint = pixelToPoint(pixelX + gridLengthPixels, pixelY + gridLengthPixels);
  let ne = projection.fromPointToLatLng(nePoint);
  let sw = projection.fromPointToLatLng(swPoint);

  let bounds = new google.maps.LatLngBounds(ne, sw);
  return bounds;
}

function drawRectangle(bounds, value) {
  if (value != null) {
    let hue = (100 - value) * 0.6;
    let colorString = 'hsl(' + hue + ', 100%, 50%)';
    dataGrid.push(new google.maps.Rectangle({
      strokeWeight: 0,
      fillColor: colorString,
      fillOpacity: 0.45,
      map: map,
      bounds: bounds,
    }));
  }
}

export {
  initGridOverlay,
  hideDataGrid,
  displayGrid,
};
