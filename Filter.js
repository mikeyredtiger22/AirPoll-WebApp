
let allDataPoints = [];
let filteredDataPoints = [];
let dataPointListeners = [];

let treatments = [];
let treatmentsHtmlElements = [];

// Callback functions to receive filtered data points
function addFilteredDataPointListener(listener) {
  dataPointListeners.push(listener);
}

function addDataPoint(dataPoint) {
  if (!treatments.includes(dataPoint.treatment)){ // todo use set
    createTreatmentFilter(dataPoint.treatment);
  }
  // allDataPoints.push(dataPoint);

  //todo: reset all data points anddd live data point methods

  // filtered..
  // filteredDataPoints.push(dataPoint);
  dataPointListeners.forEach(function (listener) {
    listener(dataPoint);
  });
}

function createTreatmentFilter(treatment) {
  treatments.push(treatment);
  let treatmentDiv = document.createElement('div');
  treatmentDiv.className = 'form-check form-check-inline';
  treatmentDiv.innerHTML =
`<input class="form-check-input" type="checkbox" id="treatment_${treatment}" value="${treatment}" checked>
<label class="form-check-label" for="treatment_${treatment}">${treatment}</label>`;

  treatmentsHtmlElements.push(treatmentDiv);
  let treatmentContainer = document.getElementById('treatments');
  treatmentContainer.appendChild(treatmentDiv);
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
  addDataPoint,
  addFilteredDataPointListener,
  addSliders,
}