let showDataGrid;
let showDataCircles;
let showDataPoints;
let showDensityHeatmap;

let showDataGridVal;
let showDataCirclesVal;
let showDataPointsVal;
let showDensityHeatmapVal;

function initButtonEventHandler(showDataGridM, showDataCirclesM, showDataPointsM, showDensityHeatmapM) {
  showDataGrid = showDataGridM;
  showDataCircles = showDataCirclesM;
  showDataPoints = showDataPointsM;
  showDensityHeatmap = showDensityHeatmapM;

  addFormButtonListeners();
}

function addFormButtonListeners() {

  const showGridButton = document.getElementById('showGrid');
  const showPointsButton = document.getElementById('showPoints');
  const showCirclesButton = document.getElementById('showCircles');
  const showHeatmapButton = document.getElementById('showHeatmap');

  showDataGridVal = !(showGridButton.innerText === 'Show Data Grid');
  showDataPointsVal = !(showPointsButton.innerText === 'Show Data Points');
  showDataCirclesVal = !(showCirclesButton.innerText === 'Show Data Circles');
  showDensityHeatmapVal = !(showHeatmapButton.innerText === 'Show Density Heatmap');

  showGridButton.onclick = function () {
    styleButton(showGridButton, !showDataGridVal);
    showGridButton.innerText = showDataGridVal ? 'Show Data Grid' : 'Hide Data Grid';
    showDataGridVal =! showDataGridVal;
    showDataGrid(showDataGridVal);
  };

  showPointsButton.onclick = function () {
    styleButton(showPointsButton, !showDataPointsVal);
    showPointsButton.innerText = showDataPointsVal ? 'Show Data Points' : 'Hide Data Points';
    showDataPointsVal =! showDataPointsVal;
    showDataPoints(showDataPointsVal);
  };

  showCirclesButton.onclick = function () {
    styleButton(showCirclesButton, !showDataCirclesVal);
    showCirclesButton.innerText = showDataCirclesVal ? 'Show Data Circles' : 'Hide Data Circles';
    showDataCirclesVal =! showDataCirclesVal;
    showDataCircles(showDataCirclesVal);
  };

  showHeatmapButton.onclick = function () {
    styleButton(showHeatmapButton, !showDensityHeatmapVal);
    showHeatmapButton.innerText = showDensityHeatmapVal ? 'Show Density Heatmap' : 'Hide Density Heatmap';
    showDensityHeatmapVal =! showDensityHeatmapVal;
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

export {
  initButtonEventHandler,
};