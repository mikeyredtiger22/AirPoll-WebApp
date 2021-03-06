import * as firebase from 'firebase/app';
import 'firebase/firestore';
import './nouislider.css'; //for webpack dependency tree
import { firebaseCredentials } from './FirebaseCredentials';
import { initDVController, filteredDataPointListener } from './DataVisualisationController';
import { initFilterPanel, addDataPoint } from './Filter';

function initApp() {
  const dataPointsDbRef = initDatabase();

  const map = initMap();
  initDVController(map);

  // Used to easily add mock data points to database
  addMapClickListener(map, dataPointsDbRef);
  initFilterPanel(filteredDataPointListener);
  addDatabaseListener(dataPointsDbRef, addDataPoint);
  addMapThemeController(map);
}

// Used in google maps library loaded callback
window.initApp = initApp;

function initDatabase() {
  const config = firebaseCredentials(); //Firebase API keys
  firebase.initializeApp(config);
  firebase.firestore().settings({timestampsInSnapshots: true});
  firebase.firestore().enablePersistence({experimentalTabSynchronization: true})
  .catch(function (err) {
    console.error('Failed offline persistence: ', err.code);
  });
  return firebase.firestore().collection('data');
}

function initMap() {
  return new google.maps.Map(document.getElementById('map'), {
    center: {lat: 50.9365, lng: -1.396},
    zoom: 15,
    //hide points of interest and public transport
    styles: mapDarkThemeStyle,
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
        timestamp: Date.now(),
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

// Gets all data points from database (oldest first) and new data points as they are added
function addDatabaseListener(dataPointsDbRef, callback) {
  dataPointsDbRef.orderBy('timestamp', 'asc').onSnapshot(function (snapshot) {
    snapshot.docChanges().forEach(function (docChange) {
      if (docChange.type === 'added') {
        callback(docChange.doc.data());
      }
    });
  });
}

// todo: will eventually move to new theme controller file (with more themes)
function addMapThemeController(map) {
  const toggleThemeButton = document.getElementById('toggleTheme');
  toggleThemeButton.onclick = function () {
    let showDarkTheme = (toggleThemeButton.innerText === 'Switch to Dark Theme');
    // Set toggle button text
    toggleThemeButton.innerText = showDarkTheme ? 'Switch to Light Theme' : 'Switch to Dark Theme';
    // Set map theme
    map.setOptions({styles: showDarkTheme ? mapDarkThemeStyle : mapLightThemeStyle});
    // Set text color
    document.body.style.color = showDarkTheme ? '#ffffff' : '#33333375';
    // Set panel background
    let panels = document.getElementsByClassName('panel');
    for (let panel of panels) {
      if (showDarkTheme) {
        panel.classList.add('darkPanel');
      } else {
        panel.classList.remove('darkPanel');
      }
    }
  };
}

const mapLightThemeStyle = [
  {
    featureType: 'poi',
    stylers: [{visibility: 'off'}],
  }, {
    featureType: 'transit.station',
    stylers: [{visibility: 'off'}],
  },
];

const mapDarkThemeStyle = [
  {
    'featureType': 'all',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'saturation': 36,
      },
      {
        'color': '#000000',
      },
      {
        'lightness': 40,
      },
    ],
  },
  {
    'featureType': 'all',
    'elementType': 'labels.text.stroke',
    'stylers': [
      {
        'visibility': 'on',
      },
      {
        'color': '#000000',
      },
      {
        'lightness': 16,
      },
    ],
  },
  {
    'featureType': 'all',
    'elementType': 'labels.icon',
    'stylers': [
      {
        'visibility': 'off',
      },
    ],
  },
  {
    'featureType': 'administrative',
    'elementType': 'geometry.fill',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 20,
      },
    ],
  },
  {
    'featureType': 'administrative',
    'elementType': 'geometry.stroke',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 17,
      },
      {
        'weight': 1.2,
      },
    ],
  },
  {
    'featureType': 'landscape',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 20,
      },
    ],
  },
  {
    'featureType': 'poi',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 21,
      },
    ],
  },
  {
    'featureType': 'road.highway',
    'elementType': 'geometry.fill',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 17,
      },
    ],
  },
  {
    'featureType': 'road.highway',
    'elementType': 'geometry.stroke',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 29,
      },
      {
        'weight': 0.2,
      },
    ],
  },
  {
    'featureType': 'road.arterial',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 18,
      },
    ],
  },
  {
    'featureType': 'road.local',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 16,
      },
    ],
  },
  {
    'featureType': 'transit',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 19,
      },
    ],
  },
  {
    'featureType': 'water',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#000000',
      },
      {
        'lightness': 17,
      },
    ],
  },
];
