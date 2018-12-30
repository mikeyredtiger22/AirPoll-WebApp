let allDataPoints = [];
let filterFunctions = [];
let filteredDataPoints = [];

let dataPointListeners = [];

let treatments = [];

// Callback functions to receive filtered data points
function addFilteredDataPointListener(listener) {
  dataPointListeners.push(listener);
}

function addDataPoint(dataPoint) {
  if (!treatments.includes(dataPoint.treatment)){ // todo use set
    createTreatmentFilter(dataPoint.treatment);
  }
  allDataPoints.push(dataPoint);

  // filtered..
  // filteredDataPoints.push(dataPoint);
  dataPointListeners.forEach(function (listener) {
    listener(dataPoint);
  });
}

function createTreatmentFilter(treatment) {
  // Create treatment checkbox
  treatments.push(treatment);
  console.log(treatments);
  const treatmentID = 'treatment_' + treatment;
  const treatmentDiv = document.createElement('div');
  treatmentDiv.className = 'form-check form-check-inline';
  treatmentDiv.innerHTML =
`<input class="form-check-input" type="checkbox" id="${treatmentID}" value="${treatment}" checked>
<label class="form-check-label" for="treatment_${treatment}">${treatment}</label>`;

  const treatmentContainer = document.getElementById('treatments');
  treatmentContainer.appendChild(treatmentDiv);

  // Add treatment filter change listener
  const checkbox = document.getElementById(treatmentID);
  checkbox.addEventListener('change', function() {
    console.log(this.value, this.checked);
  });
}

function addSliders() {
  // Create date and time sliders
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;
  let dateSliderElement = document.getElementById('dateFilterSlider');
  let timeSliderElement = document.getElementById('timeFilterSlider');

  let dateSlider = noUiSlider.create(dateSliderElement, {
    start: [new Date('2018').getTime(), new Date('2019').getTime()],
    connect: true,
    behaviour: 'drag-snap',
    step: day,
    range: {
      'min': new Date('2018').getTime(),
      'max': new Date('2019').getTime(),
    }
  });
  let timeSlider = noUiSlider.create(timeSliderElement, {
    start: [0, day],
    connect: true,
    behaviour: 'drag-snap',
    step: hour,
    range: {
      'min': 0,
      'max': day
    }
  });

  // Add date and time slider change listeners
  dateSlider.on('change', function (values, handle, unencoded) {
    let startDate = new Date(unencoded[0]).toDateString();
    let endDate = new Date(unencoded[1]).toDateString();
    let dateRangeString = startDate + ' - ' + endDate;
    document.getElementById('dateRangeOutput').innerHTML = 'Date Range: ' + dateRangeString;
  });

  timeSlider.on('change', function (values, handle, unencoded) {
    let startTime = parseInt(unencoded[0]/hour);
    let endTime = parseInt(unencoded[1]/hour) % 24;
    let timeRangeString = startTime + ':00 - ' + endTime + ':00';
    document.getElementById('timeRangeOutput').innerHTML = 'Time Range: ' + timeRangeString;
  });
}

export {
  addDataPoint,
  addFilteredDataPointListener,
  addSliders,
}
