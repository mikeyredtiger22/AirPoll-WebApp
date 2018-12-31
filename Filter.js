let allDataPoints = [];
let filteredDataPoints = [];
let addFilteredDataPoint, resetFilteredDataPoints;

let allTreatments = [];
let treatmentsToShow = new Set();

// Callback functions to receive and reset filtered data points
function addFilteredDataPointListener(addDataPoint, resetDataPoints) {
  addFilteredDataPoint = addDataPoint;
  resetFilteredDataPoints = resetDataPoints;
}

// Called from database
function addDataPoint(dataPoint) {
  // Create treatments
  if (!allTreatments.includes(dataPoint.treatment)){
    createTreatmentFilter(dataPoint.treatment);
  }

  allDataPoints.push(dataPoint);

  // Send to Data Visualisation (filtered data point listener)
  if (dataPointFilter(dataPoint)) {
    addFilteredDataPoint(dataPoint);
  }
}

function dataPointFilter(dataPoint) {
  return treatmentsToShow.has(dataPoint.treatment);
}

function updateFilteredDataPoints() {
  // Reset filtered data points
  filteredDataPoints = allDataPoints.filter(dataPointFilter);
  resetFilteredDataPoints();
  filteredDataPoints.forEach(function (dataPoint) {
    // todo, better to send whole array?
    addFilteredDataPoint(dataPoint);
  });
}

function createTreatmentFilter(treatment) {
  // Create treatment checkbox
  allTreatments.push(treatment);
  treatmentsToShow.add(treatment);

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
    if (this.checked) {
      treatmentsToShow.add(this.value);
    } else {
      treatmentsToShow.delete(this.value);
    }
    updateFilteredDataPoints();
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
