(function () {
    'use strict';

	angular.module('asafertrip')
		.controller('MusicController', ['$scope', 'musicServices', 'audioBufferServices', '$timeout', function ($scope, musicServices, audioBufferServices, $timeout) {

            var init = function()  {
            	$scope.sentences = [];
        		$scope.locations = {};
				$scope.musics= musicServices.getData();

				audioBufferServices.playSound($scope.musics);

				sequenceSentences($scope.musics);
            };


            var sequenceSentences = function (sources) {
				 sources.forEach(function (sourceWrapper) {
					$timeout(function () {
						$scope.sentences.push(sourceWrapper.sentence);
					}, sourceWrapper.startTime);
				 });
			 }


			init();

		}]);
})();