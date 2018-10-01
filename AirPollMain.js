import { firebaseCredentials } from './FirebaseCredentials';
import { initDVController } from './DataVisualisationController';
import { addSliders, createTreatmentFilters } from './Filter';

function initApp() {
  const config = firebaseCredentials(); //Firebase API keys
  firebase.initializeApp(config);
  const dataPointsDbRef = firebase.firestore().collection('data');

  const map = initMap();

  addMapClickListener(map, dataPointsDbRef);
  addSliders();

  getDataPointsFromDB(dataPointsDbRef, function(dataPoints) {
    initDVController(map, dataPoints);
    let treatmentArray = dataPoints.map(x => x.data().treatment);
    let treatments = new Set(treatmentArray); //todo must update with new live data
    createTreatmentFilters(treatments);
  });

  //todo create (filtered) datapoint listener interface - if needed in more than one place
}

window.initApp = initApp;

function initMap() {
  return new google.maps.Map(document.getElementById('map'), {
    center: {lat: 50.9365, lng: -1.396},
    zoom: 15,
    //hide points of interest and public transport
    styles: [{
      featureType: 'poi',
      stylers: [{visibility: 'off'}],
    }, {
      featureType: 'transit.station',
      stylers: [{visibility: 'off'}],
    }],
    disableDoubleClickZoom: true,
    streetViewControl: false,
  });
}

function addMapClickListener(map, dataPointsDbRef) {
  map.addListener('click', function (mapLayer) {
    // todo migrate to new datapoint structure
    const dataPoint = {
      latlng: mapLayer.latLng.toJSON(),
      value: Math.floor((Math.random() * 100)).toString(),
      date: new Date().toUTCString(),
    };

    addNewDataPointClickToDb(dataPointsDbRef, dataPoint);
  });
}

function addNewDataPointClickToDb(dataPointsDbRef, dataPoint) {
  dataPointsDbRef.add(dataPoint).then(function (docRef) {
    console.log('Document written with ID: ', docRef.id);
  }).catch(function (error) {
    console.error('Error adding document: ', error);
  });
}

function getDataPointsFromDB(dataPointsDbRef, callback) {
  dataPointsDbRef.get().then(function (dataPoints) {
    callback(dataPoints.docs);
  });
}

//TODO: get datapoints as they are added to database
