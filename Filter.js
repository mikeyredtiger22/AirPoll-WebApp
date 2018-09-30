
function createTreatmentFilters(treatments) {
  //todo: get all DP treatments
  //todo: create div element (checkbox) for each
  //todo: attach listener to hide datapoints & DV (high level filter)
  const showGridButton = document.getElementById('showGrid');
}

export function addSliders() {
  let dateSliderElement = document.getElementById('dateFilterSlider');
  let timeSliderElement = document.getElementById('timeFilterSlider');

  let dateSlider = noUiSlider.create(dateSliderElement, {
    start: [new Date('2018').getTime(), new Date('2019').getTime()],
    connect: true,
    behaviour: 'drag-snap',
    step: (24 * 60 * 60 * 1000),
    range: {
      'min': new Date('2018').getTime(),
      'max': new Date('2019').getTime(),
    }
  });
  let timeSlider = noUiSlider.create(timeSliderElement, {
    start: [0, (24 * 60 * 60 * 1000)],
    connect: true,
    behaviour: 'drag-snap',
    step: (60 * 60 * 1000),
    range: {
      'min': 0,
      'max': (24 * 60 * 60 * 1000)
    }
  });

  dateSlider.on('change', function (values, handle, unencoded) {
    let startDateString = new Date(unencoded[0]).toDateString();
    let endDateString = new Date(unencoded[1]).toDateString();
    let dateRangeString = startDateString + ' - ' + endDateString;
    document.getElementById('dateRangeOutput').innerHTML = 'Date Range: ' + dateRangeString;
  });

  timeSlider.on('change', function (values, handle, unencoded) {
    let startTimeString = parseInt(unencoded[0]/(60 * 60 * 1000));
    let endTimeString = parseInt(unencoded[1]/(60 * 60 * 1000)); //todo fix 15.000...2
    let timeRangeString = startTimeString + ' - ' + endTimeString;
    document.getElementById('timeRangeOutput').innerHTML = 'Time Range: ' + timeRangeString;
  });

}