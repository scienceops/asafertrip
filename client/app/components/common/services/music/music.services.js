(function () {
    'use strict';

	angular.module('asafertrip')
		.factory('musicServices', [function () {
			return {
				getData: function() {
				  return  [{sampleUrl: "resources/cat.wav", startTime: 0, sentence:"sentence 1"},
                           {sampleUrl: "resources/cow.wav", startTime: 3000, sentence:"sentence 2"},
                           {sampleUrl: "resources/cow.wav", startTime: 5000, sentence:"sentence 3"},
                           {sampleUrl: "resources/cat.wav", startTime: 7000, sentence:"sentence 4"}
                          ];
				  }
			}
		}]);
})();