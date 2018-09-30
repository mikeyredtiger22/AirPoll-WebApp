
function createTreatmentFilters(treatments) {
  //todo: get all DP treatments
  //todo: create div element (checkbox) for each
  //todo: attach listener to hide datapoints & DV (high level filter)
  const showGridButton = document.getElementById('showGrid');
}

export function addSliders() {
  let dateSlider = document.getElementById('dateSlider');
  let timeSlider = document.getElementById('timeSlider');

  noUiSlider.create(dateSlider, {
    start: [20, 80],
    connect: true,
    range: {
      'min': 0,
      'max': 100
    }
  });
  noUiSlider.create(timeSlider, {
    start: [20, 80],
    connect: true,
    range: {
      'min': 0,
      'max': 100
    }
  });
}