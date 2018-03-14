


/**
 * Creates a map object with a click listener and a heatmap.
 */
function initApp() {

	var map = initMap();
	var heatmap = initHeatmap(map);
	var config = initFirebase(); //Firebase API key stuff:
	firebase.initializeApp(config);
	var dataPointsDbRef = firebase.firestore().collection('datapoints');

	addMapClickListener(map, heatmap, dataPointsDbRef);
	addDataPointDbListener(dataPointsDbRef, map);
}

function initMap() {
	return new google.maps.Map(document.getElementById('map'), {
		center: {lat: 50.9365, lng: -1.396},
		zoom: 18,
		//hide points of interest and public transport
		styles: [{
			featureType: 'poi',
			stylers: [{ visibility: 'off' }]
		}, {
			featureType: 'transit.station',
			stylers: [{ visibility: 'off' }]
		}],
		disableDoubleClickZoom: true,
		streetViewControl: false
	});
}

//Heatmap is only used to show where we have data
function initHeatmap(map) {
	var heatmap = new google.maps.visualization.HeatmapLayer();
	heatmap.setMap(map);
	return heatmap;
}

function initFirebase() {
	return {
	};
}

function addMapClickListener(map, heatmap, dataPointsDbRef) {
	map.addListener('click', function(mapLayer) {
		var latlng = mapLayer.latLng;
		var randomWeight = Math.floor((Math.random() * 100));

		addNewDataPointClickToDb(dataPointsDbRef, latlng, randomWeight);
		addMarkerToMap(latlng, map, randomWeight);
		// heatmap.getData().push(latlng); hiding heatmap
	});
}

function addNewDataPointClickToDb(dataPointsDbRef, latlng, data) {
	dataPointsDbRef.add({
		latlng: latlng.toJSON(),
		data: data,
		title: "hello!"
	}).then(function(docRef) {
		console.log("Document written with ID: ", docRef.id);
	}).catch(function(error) {
		console.error("Error adding document: ", error);
	});
}

function addDataPointDbListener(dataPointsDbRef, map) {
	dataPointsDbRef.get().then(function(dataPoints) {
		dataPoints.forEach(function(dataPoint) {
			addMarkerToMap(dataPoint.data().latlng, map, dataPoint.data().data)

		});
	});
}


function addTaskMarkersListeners(ref, map) {
	// add listener for every task in database now
	ref.once('value').then(function(snapshot) {
		snapshot.forEach(function (child) {

			var taskJson = JSON.parse(child.val());
			var marker = new google.maps.Marker({
				position: {lat: taskJson.locationLats[0], lng: taskJson.locationLongs[0]},
				title: taskJson.title,
				label: markerLabels[markeLabelIndex++ % markerLabels.length],
				map: map
			});
		})
	});
	// add listener for each new task added from now on
	ref.on('child_added', function(snapshot) {
		snapshot.forEach(function (child) {

			var taskJson = JSON.parse(child.val());
			var marker = new google.maps.Marker({
				position: {lat: taskJson.locationLats[0], lng: taskJson.locationLongs[0]},
				title: taskJson.title,
				label: markerLabels[markeLabelIndex++ % markerLabels.length],
				map: map
			});
		});
	});
}


function addTestMarkersListener(ref, map) {
	// adds all existing markers and new markers added from now on
	ref.on('child_added', function(snapshot) {
		addMarkerToMap(snapshot.val(), map);
	});
}


function addMarkerToMap(latlng, map, weight) {
	var hue = (100 - weight) * 2.4;
	var colorString = "hsl(" + hue +", 100%, 50%)";
	new google.maps.Marker({
		position: latlng,
		label: weight.toString(),
		map: map,
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			strokeColor: colorString,
			strokeOpacity: 0.8,
			strokeWeight: 1,
			fillColor: colorString,
			fillOpacity: 0.4,
			scale: 100
		}
	});
}

