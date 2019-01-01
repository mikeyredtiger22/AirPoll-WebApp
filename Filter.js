let allDataPoints = [];
let filteredDataPoints = [];
let filteredDataPointListener;

let allTreatments = [];
let treatmentsToShow = new Set();

let dateSlider, timeSlider;
let dateStartInit, dateEnd, minTimestamp = Date.now();
let noDateRangeSpecified = true, noTimeRangeSpecified = true;
let dateFilterStart, dateFilterEnd;

function initFilterPanel(listener) {
  // Set filtered data point listener (callback functions to receive and reset filtered data points)
  filteredDataPointListener = listener;

  addDateTimeFilterSliders();
}

// Called from database
function addDataPoint(dataPoint) {
  allDataPoints.push(dataPoint);

  // Create treatments
  if (!allTreatments.includes(dataPoint.treatment)) {
    createTreatmentFilter(dataPoint.treatment);
  }

  // Get minimum timestamp for date filter slider
  if (dataPoint.timestamp < minTimestamp) {
    // This should only be called once, data points are retrieved oldest first
    minTimestamp = dataPoint.timestamp;
    updateDateSliderMin();
  }

  // Send to Data Visualisation (filtered data point listener)
  if (dataPointFilter(dataPoint)) {
    filteredDataPointListener.addDataPoint(dataPoint);
  }
}

function dataPointFilter(dataPoint) {
  if (!treatmentsToShow.has(dataPoint.treatment)) {
    return false;
  } else {
    if (!noDateRangeSpecified) {
      return (dataPoint.timestamp > dateFilterStart &&
        dataPoint.timestamp < dateFilterEnd);
    }
    return true;
  }
}

function updateFilteredDataPoints() {
  // Reset filtered data points, we reset all data points
  // to prevent concurrency issues with multiple actions
  filteredDataPointListener.resetDataPoints();

  // Get date and time filter values
  const values = dateSlider.get();
  dateFilterStart = parseInt(values[0]);
  dateFilterEnd = parseInt(values[1]);

  filteredDataPoints = [];
  allDataPoints.forEach(function (dataPoint) {
    if (dataPointFilter(dataPoint)) {
      filteredDataPoints.push(dataPoint);
      filteredDataPointListener.addDataPoint(dataPoint);
    }
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
  checkbox.addEventListener('change', function () {
    if (this.checked) {
      treatmentsToShow.add(this.value);
    } else {
      treatmentsToShow.delete(this.value);
    }
    updateFilteredDataPoints();
  });
}

function createSlider(element, min, max, step) {
  return noUiSlider.create(element, {
    range: {'min': min, 'max': max},
    start: [min, max],
    step: step,
    connect: true,
    behaviour: 'drag-snap'
  });
}

function addDateTimeFilterSliders() {
  const day = 24 * 60 * 60 * 1000;
  const today = new Date();
  dateEnd = today.setDate(today.getDate() + 1);
  dateStartInit = new Date('2018').getTime();
  const dateSliderElement = document.getElementById('dateFilterSlider');
  const timeSliderElement = document.getElementById('timeFilterSlider');

  // Create date and time sliders
  dateSlider = createSlider(dateSliderElement, dateStartInit, dateEnd, day);
  timeSlider = createSlider(timeSliderElement, 0, 24, 1);
  setDateFilterString(dateStartInit, dateEnd);
  setTimeFilterString(0, 24);

  // Add date and time slider change listeners
  dateSlider.on('change', function (values, handle, unencoded) {
    setDateFilterString(unencoded[0], unencoded[1]);
  });

  timeSlider.on('change', function (values, handle, unencoded) {
    setTimeFilterString(unencoded[0], unencoded[1]);
  });
}

function updateDateSliderMin() {
  dateSlider.updateOptions({
    range: {'min': minTimestamp, 'max': dateEnd},
    start: [minTimestamp, dateEnd]
  });
  setDateFilterString(minTimestamp, dateEnd);
}

function setDateFilterString(start, end) {
  let dateRangeString;
  if (start === minTimestamp && end === dateEnd) {
    noDateRangeSpecified = true;
    dateRangeString = 'All Dates';
  } else {
    noDateRangeSpecified = false;
    let startDate = new Date(start).toDateString();
    let endDate = new Date(end).toDateString();
    dateRangeString = startDate + ' - ' + endDate;
  }
  document.getElementById('dateRangeOutput').innerHTML = 'Date Range: ' + dateRangeString;
  updateFilteredDataPoints();
}

function setTimeFilterString(start, end) {
  let timeRangeString;
  if (start === 0 && end === 24) {
    noTimeRangeSpecified = true;
    timeRangeString = 'All Day';
  } else {
    noTimeRangeSpecified = false;
    let startTime = parseInt(start);
    let endTime = parseInt(end) % 24;
    timeRangeString = startTime + ':00 - ' + endTime + ':00';
  }
  document.getElementById('timeRangeOutput').innerHTML = 'Time Range: ' + timeRangeString;
  updateFilteredDataPoints();
}

export {
  initFilterPanel,
  addDataPoint,
};
