var audioContext = new (window.AudioContext || window.webkitAudioContext)();

// our sample set - should come from the backend
var samples = [{sampleUrl: "cat.wav", startTime: 0},
	       {sampleUrl: "cow.wav", startTime: 3000},
	       {sampleUrl: "cow.wav", startTime: 5000},
	       {sampleUrl: "cat.wav", startTime: 7000}];

// load the audio files
var sources = loadSamples(audioContext, samples);
sequenceSources(audioContext, sources);

function loadSamples(context, samples) {
    // load the audio files
    var sources = [];
    samples.forEach(function (sample) {
	sources.push({sampleUrl: sample.sampleUrl,
		      startTime: sample.startTime,
		      source: loadSampleFile(context, sample.sampleUrl)});
    });
    return sources;
}

function sequenceSources(context, sources) {
    sources.forEach(function (sourceWrapper) {
	window.setTimeout(function () {
	    sourceWrapper.source.start();
	}, sourceWrapper.startTime);
    });
}

function loadSampleFile(context, url) {
    var request = new XMLHttpRequest();
    var source = context.createBufferSource();
    
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // Decode asynchronously
    request.onload = function() {
	var audioData = request.response;
	
	context.decodeAudioData(audioData, function(buffer) {
	    source.buffer = buffer;
	    source.loop = true;
	    source.connect(context.destination);
	}, function (e) {"Error decoding the audio data" + e.err});
    }

    request.send();
    return source;
}
