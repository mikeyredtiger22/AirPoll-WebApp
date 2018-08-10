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
  showDensityHeatmapVal = !(showHeatmapButton.innerText === 'Show Heatmap');

  showGridButton.onclick = function () {
    styleButton(showGridButton, !showDataGridVal);
    showGridButton.innerText = showDataGridVal ? 'Show Data Grid' : 'Hide Data Grid';
    showDataGridVal =! showDataGridVal;
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
    if (showDensityHeatmapVal) {
      showHeatmapButton.innerText = 'Show Heatmap';
      showHeatmapButton.classList.remove('btn-primary');
      showHeatmapButton.classList.add('btn-outline-primary');
    } else {
      showHeatmapButton.innerText = 'Hide Heatmap';
      showHeatmapButton.classList.remove('btn-outline-primary');
      showHeatmapButton.classList.add('btn-primary');
    }
    showDensityHeatmapVal = ! showDensityHeatmapVal;
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