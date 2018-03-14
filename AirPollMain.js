


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

		var dataPoint = {
			latlng: mapLayer.latLng.toJSON(),
			value: Math.floor((Math.random() * 100)).toString(),
			date: new Date().toString()
		};

		addNewDataPointClickToDb(dataPointsDbRef, dataPoint);
		// var latlng = {lat : dataPoint.latlng.lat, lng: dataPoint.latlng.lng};
		addMarkerToMap(map, dataPoint, mapLayer.latLng.toJSON());
		// heatmap.getData().push(latlng); hiding heatmap
	});
}

function addNewDataPointClickToDb(dataPointsDbRef, dataPoint) {
	dataPointsDbRef.add(dataPoint).then(function(docRef) {
		console.log("Document written with ID: ", docRef.id);
	}).catch(function(error) {
		console.error("Error adding document: ", error);
	});
}

function addDataPointDbListener(dataPointsDbRef, map) {
	dataPointsDbRef.get().then(function(dataPoints) {
		dataPoints.forEach(function(dataPoint) {
			addMarkerToMap(map, dataPoint.data(), dataPoint.data().latlng)
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


function addMarkerToMap(map, dataPoint, latlng) {
	var hue = (100 - dataPoint.value) * 2.4;
	var colorString = "hsl(" + hue +", 100%, 50%)";
	new google.maps.Marker({
		position: latlng,
		label: dataPoint.value.toString(),
		map: map,
		icon: {
			path: google.maps.SymbolPath.CIRCLE,
			strokeColor: colorString,
			strokeOpacity: 0,
			strokeWeight: 1,
			fillColor: colorString,
			fillOpacity: 0,
			scale: 100
		}
	});
	new google.maps.Circle({
		strokeOpacity: 0,
		fillColor: colorString,
		fillOpacity: 0.5,
		map: map,
		center: latlng,
		radius: 10
	});
	new google.maps.Circle({
		strokeOpacity: 0,
		fillColor: colorString,
		fillOpacity: 0.3,
		map: map,
		center: latlng,
		radius: 20
	});
	new google.maps.Circle({
		strokeOpacity: 0,
		fillColor: colorString,
		fillOpacity: 0.1,
		map: map,
		center: latlng,
		radius: 50
	});
}

