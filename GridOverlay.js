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
  let grids = 50; // 20 grids, end to end on smallest screen dimension

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
        sum: null,
        count: 0,
        avgValue: null,
        blendValue: null,
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
        let avgValue = (sum / dataPoints.length).toFixed(2);
        gridDataCollection[gridX][gridY].sum = sum;
        gridDataCollection[gridX][gridY].avgValue = avgValue;
        gridDataCollection[gridX][gridY].count = dataPoints.length;
      }
    }
  }

  // Blend grid
  let blendedGridDataCollection = blendGrid(gridDataCollection);
  for (let gridX = 0; gridX < gridsCountX; gridX++) {
    for (let gridY = 0; gridY < gridsCountY; gridY++) {
      let bounds = blendedGridDataCollection[gridX][gridY].bounds;
      let avgValue = blendedGridDataCollection[gridX][gridY].avgValue;
      let blendValue = blendedGridDataCollection[gridX][gridY].blendValue;

      if (avgValue) {
        // drawRectangle(bounds, avgValue);
      }

      if (blendValue) {
        drawRectangle(bounds, blendValue);
      }
    }
  }
}

function blendGrid(gridDataCollection) {

  let gridsCountX = gridDataCollection.length;
  let gridsCountY = gridDataCollection[0].length;

  for (let gridX = 0; gridX < gridsCountX; gridX++) {
    for (let gridY = 0; gridY < gridsCountY; gridY++) {
      let avg = 0;
      let count = 0;

      // blend0
      if (gridDataCollection[gridX][gridY].avgValue) {
        avg += gridDataCollection[gridX][gridY].avgValue;
        count += 1;
      }

      let blendResult;
      let currBlendRange = 2;
      let stop = false;
      do {
        currBlendRange++;
        blendResult = null;
        blendResult = blendRangeF(currBlendRange, gridX, gridY, gridsCountX, gridsCountY, gridDataCollection);
        stop = (blendResult.count > currBlendRange -1 || currBlendRange > 5);
      } while (!stop);

      let finalValue = null;
      if (blendResult.blendValue && blendResult.count > currBlendRange -1) {
        finalValue = blendResult.blendValue;
      }

      gridDataCollection[gridX][gridY].blendValue = finalValue;
    }
  }
  return gridDataCollection;
}

function blendRangeF(blendRange, gridX, gridY, gridsCountX, gridsCountY, gridDataCollection) {
  let result = { sum: 0, count: 0 };
  for (let xIndex = gridX - blendRange; xIndex <= gridX + blendRange; xIndex++) {
    if (xIndex < 0 || xIndex >= gridsCountX) continue;
    for (let yIndex = gridY - blendRange; yIndex <= gridY + blendRange; yIndex++) {
      if (yIndex < 0 || yIndex >= gridsCountY) continue;

      if (gridDataCollection[xIndex][yIndex].count > 0) {
        result.sum += parseInt(gridDataCollection[xIndex][yIndex].sum);
        result.count += parseInt(gridDataCollection[xIndex][yIndex].count);
      }
    }
  }
  if (result.count > 0) {
    result.blendValue = (result.sum / result.count).toFixed(2);
  }
  return result;
}

function pixelToPoint(pixelX, pixelY) {
  return new google.maps.Point((pixelX / scale) + sw.x, (pixelY / scale) + ne.y);
}

function gridToBounds(pixelX, pixelY) {
  let nePoint = pixelToPoint(pixelX, pixelY);
  let swPoint = pixelToPoint(pixelX + gridLengthPixels, pixelY + gridLengthPixels);
  let ne = projection.fromPointToLatLng(nePoint);
  let sw = projection.fromPointToLatLng(swPoint);

  return new google.maps.LatLngBounds(ne, sw);
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
