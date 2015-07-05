var audioContext = new (window.AudioContext || window.webkitAudioContext)();

//// our sample set - should come from the backend
//var samples = [{sampleUrl: "cat.wav", startTime: 0, sentence:"sentence 1"},
//	       {sampleUrl: "cow.wav", startTime: 3000, sentence:"sentence 2"},
//	       {sampleUrl: "cow.wav", startTime: 5000, sentence:"sentence 3"},
//	       {sampleUrl: "cat.wav", startTime: 7000, sentence:"sentence 4"}];

// load the audio files
var sources = loadSamples(audioContext, samples);

// sequence them!
sequenceSources(sources);

// loads a set of samples passed in as an array of JSON objects:
// [{sampleUrl: <URL for sample file>,
//   startTime: <time delay until playback when we sequence in milliseconds>}]
function loadSamples(context, samples) {
    var sources = [];
    samples.forEach(function (sample) {
	sources.push({sampleUrl: sample.sampleUrl,
		      startTime: sample.startTime,
		      source: loadSampleFile(context, sample.sampleUrl)});
    });
    return sources;
}

// sequences an array of pre-loaded sources using some window timers, the
// sources are specified as:
// [{sampleUrl: <URL for sample file>,
//   startTime: <time delay until playback when we sequence in milliseconds>,
//   source: <handle object for the buffered source that was connected to the audio context>}]
function sequenceSources(sources) {
    sources.forEach(function (sourceWrapper) {
	window.setTimeout(function () {
	    sourceWrapper.source.start();
	}, sourceWrapper.startTime);
    });
}

// loads a sample file from a given url via XHR, buffers it into a Web Audio source and connects
// it to the given audio context
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
