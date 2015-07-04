(function () {
	'use strict';

	var context;
	window.addEventListener('load', init, false);
	function init() {
		try {
			// Fix up for prefixing
			window.AudioContext = window.AudioContext || window.webkitAudioContext;
			context = new AudioContext();
		}
		catch (e) {
			alert('Web Audio API is not supported in this browser');
		}
	}

})();