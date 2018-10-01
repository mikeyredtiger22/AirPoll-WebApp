
function createTreatmentFilters(treatments) {
  console.log(treatments);
  // todo relabel 'undefined' treatment or fix data
  /*
  <div class="form-check form-check-inline">
      <input class="form-check-input" type="checkbox" id="inlineCheckbox3" value="C">
      <label class="form-check-label" for="inlineCheckbox3">Treatment C</label>
  </div>
   */
  //todo: create div element (checkbox) for each
  //todo: attach listener to hide datapoints & DV (high level filter)
}

function addSliders() {
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
    let endTimeString = parseInt(unencoded[1]/(60 * 60 * 1000));
    let timeRangeString = startTimeString + ' - ' + endTimeString;
    document.getElementById('timeRangeOutput').innerHTML = 'Time Range: ' + timeRangeString;
  });
}

export {
  createTreatmentFilters,
  addSliders,
}