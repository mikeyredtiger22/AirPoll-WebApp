import './nouislider.css'; //for webpack dependency tree
import { firebaseCredentials } from './FirebaseCredentials';
import { initDVController, addFilteredDataPoint } from './DataVisualisationController';
import { addSliders, addDataPoint, addFilteredDataPointListener } from './Filter';

function initApp() {
  const config = firebaseCredentials(); //Firebase API keys
  firebase.initializeApp(config);
  const dataPointsDbRef = firebase.firestore().collection('data');

  const map = initMap();
  initDVController(map);

  addMapClickListener(map, dataPointsDbRef);
  addFilteredDataPointListener(addFilteredDataPoint);
  addDataPointsListener(dataPointsDbRef, addDataPoint);
  addSliders();

  // getDataPointsFromDB(dataPointsDbRef, function(dataPoints) {
  //   initDVController(map, dataPoints);
  //   // let treatmentArray = dataPoints.map(x => x.data().treatment);
  //   // let treatments = new Set(treatmentArray);
  //   // createTreatmentFilters(treatments);
  // });
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
    fullscreenControl: false,
  });
}

function addMapClickListener(map, dataPointsDbRef) {
  map.addListener('click', function (mapLayer) {
    getRandomValues((treatment, sensorID) => {
      const dataPoint = {
        lat: mapLayer.latLng.lat(),
        lng: mapLayer.latLng.lng(),
        value: Math.floor((Math.random() * 100)).toString(),
        timestamp: new Date().toUTCString(),
        sensorID: sensorID,
        treatment: treatment,
      };

      addNewDataPointClickToDb(dataPointsDbRef, dataPoint);
    });
  });
}

function getRandomValues(callback) {
  let randomVal = Math.random();
  let treatment = randomVal < 0.3 ? 'A' :
    randomVal < 0.7 ? 'B' : 'C';
  let sensorID = 'test' + randomVal.toString()[2] + treatment;
  callback(treatment, sensorID);
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

// todo reword / comment
function addDataPointsListener(dataPointsDbRef, callback) {
  dataPointsDbRef.onSnapshot(function (snapshot) {
    snapshot.docChanges.forEach(function (docChange) {
      if (docChange.type === "added") {
        callback(docChange.doc.data());
      }
    });
  });
}
