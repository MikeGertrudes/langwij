var app = angular.module('langwij', [
	]);

function googleApiClientReady () {
	gapi.client.setApiKey('AIzaSyBiWFSGUblt1LTX6UxzvKjy5Yiblt6H1gA');
	gapi.client.load('youtube', 'v3', manuallyBootstrapAngular);
}

// spoof it for now;
//manuallyBootstrapAngular();

function manuallyBootstrapAngular () {
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['langwij']);
	});
}

function onPlayerReady(event) {

	console.log('player ready');
	// // bind events
	// var playButton = document.getElementById('player_control_play');
	// playButton.addEventListener('click', function() {
	// 	player.playVideo();
	// });

	// var pauseButton = document.getElementById('player_control_pause');
	// pauseButton.addEventListener('click', function() {
	// 	player.pauseVideo();
	// });

}


app.controller('langwijController', function ($scope, $document, JsonService, SearchVideos) {

		$scope.languages = [
			{
				name: 'Choose a Language...',
				value: 0,
				icon: 'flag-united-states'
			}, 
			{
				name: 'Spanish',
				value: 'espanol',
				icon: 'flag-spain'
			}, 
			{
				name: 'French',
				value: 'francais',
				icon: 'flag-france'
			}, 
			{	
				name: 'Portuguese',
				value: 'portugues',
				icon: 'flag-portugal'
			}
		];

		// default starting language
		$scope.selectedLanguage = $scope.languages[0]; // Choose a language...
		//$scope.selectedLanguage; // Choose a language...


		// if the google youtube api exists, search it, otherwise fallback to static
		//console.log($scope.selectedLanguage.value);

		// commenting this out to not have a starting language chosen/and videos
		//if (gapi.length !== 0) {

		//	updateVideos($scope.selectedLanguage);

		//} else {
		//	// get playlist
		//	var getPlaylist = JsonService.someFunc();
		//	getPlaylist.then( function(response) {
		//		$scope.playlistItems = response.data;
		//		console.log(response.data);
		//	});
		//}

		// search videos
		//function updateVideos (language) {
		$scope.$watch('selectedLanguage', function() {
			
			if ($scope.selectedLanguage.value !== 0) {

				$scope.updateVideos($scope.selectedLanguage.value);

				// if the slidepanel is open, close it
				// TODO: find a better way to do this
				$scope.closeSlidePanel();

			} else {
				console.error('selectedLanguage is not defined');
			}

		}, true);

		$scope.updateVideos = function(language) {

			$scope.showLoading = true;

			// do something here
			var searchVideos = SearchVideos.search(language);

			searchVideos.execute(function(response) {
				var str = JSON.stringify(response.result);

				// let's map the youtube api

				var tmpArray = [];

				for (var i = 0; i <= (response.result.items.length - 1); i++) {
					var tmpObject = {};

					tmpObject.itemTitle = response.result.items[i].snippet.title;
					tmpObject.thumbnail =  response.result.items[i].snippet.thumbnails['default'].url;
					tmpObject.language = $scope.selectedLanguage;
					tmpObject.duration = 'n/a';
					tmpObject.url = 'http://www.youtube.com/embed/' + response.result.items[i].id.videoId;
					tmpObject.v = response.result.items[i].id.videoId;

					// update the tmp array
					tmpArray.push(tmpObject);
				}

				// hide the loading screen
				$scope.showLoading = false;

				// need this arghhhh to get it to update correctly
				// is it the right way???
				// it works though :/
				$scope.$apply(function () {
					$scope.playlistItems = tmpArray;
				});

				// actually need this for the list to update
				// adding this here makes it work off the bat, on page load
				// commenting it out allows it to work everytime we toggle the dropdown
				// but now, its returning late results, results from the previous drop
				// so there is a delay
				// i see, it could be because it only because an angular app once google returns, which sucks...hmmm
				//$scope.$apply();
			});
		};

		$scope.changeVideoURL = function (playlistItem, index) {

			// get the clicked playlist item's youtube id
			$scope.v = playlistItem.v;

			$scope.currentItem = playlistItem;
			$scope.currentItemIndex = index;

			// make a new player listener and when ready, play it
			if (!$scope.player) {
				// player does not exist yet, create it
				console.log('player does not exist yet, lets create one');
				$scope.player = new YT.Player('video', {
					// height: '390',
					// width: '640',
					videoId: $scope.v,
					events: {
						// call this function when player is ready to use
						'onReady': $scope.playVideo,
						'onStateChange': $scope.videoStopped
					}
				});
			} else {
				// player exists
				console.log('player exists');
				$scope.player.loadVideoById($scope.v);
			}

			$scope.highlightCurrentVideo($scope.v);
		};

		$scope.itemClass = function (playlistItem) {
			return playlistItem === $scope.currentItem ? 'is-playing' : undefined;
		};

		// youtube-specific controls
		$scope.playVideo = function () {
			console.log('video is onReady');
			console.log($scope.player);
			$scope.player.playVideo();
		};

		$scope.pauseVideo = function () {
			$scope.player.pauseVideo();
		};

		$scope.stopVideo = function () {
			$scope.player.stopVideo();
		};

		$scope.videoStopped = function (event) {
			// sense for 0, that's youtube telling us the video has stopped
			if (event.data === 0) {
				console.log('video stopped');
				$scope.nextVideo();
			}
		};

		// custom playlist controls
		$scope.prevVideo = function () {
			var tmp = $scope.currentItemIndex - 1;
			
			if (tmp >= 0) {
				$scope.currentItemIndex = tmp;
				$scope.currentItem = $scope.playlistItems[ $scope.currentItemIndex ];
				$scope.v = $scope.currentItem.v;
				$scope.changeVideoURL($scope.currentItem, $scope.currentItemIndex);
			} else {
				console.log('sorry bro we at the start of the list');
			}
			// TODO make this so that we don't need v AND currentItem. A change to current update should just do it
		};

		$scope.nextVideo = function () {

			var tmp = $scope.currentItemIndex + 1;
			
			if (tmp < $scope.playlistItems.length) {
				$scope.currentItemIndex = tmp;
				$scope.currentItem = $scope.playlistItems[ $scope.currentItemIndex ];
				$scope.v = $scope.currentItem.v;
				$scope.changeVideoURL($scope.currentItem, $scope.currentItemIndex);
			} else {
				console.log('sorry bro we at the end of the list');

			}
			// TODO make this so that we don't need v AND currentItem. A change to current update should just do it
		};

		// styles
		$scope.highlightCurrentVideo = function (v) {
			console.log('highlightCurrentVideo', '#playlist_' + v);
			angular.element(document.querySelector('.is-playing')).removeClass('is-playing');
			angular.element(document.getElementById('playlist_' + v) ).addClass('is-playing');
		};

		$scope.closeSlidePanel = function () {
			console.log('close slidepanel');
			angular.element(document.getElementById('nav_primary_toggle')).checked = false;
		}

		$scope.openSlidePanel = function () {
			console.log('open slidepanel');
			angular.element(document.getElementById('nav_primary_toggle')).checked = true;
		}

		// document.addEventListener( 'keyup', function(event) { 
		// 	if (event.keyCode === 37) { /* LEFT */
		// 		$scope.prevVideo();
		// 	} else if (event.keyCode === 39) { /* RIGHT */
		// 		$scope.nextVideo();
		// 	}
		// });


		// TODO: find out how to find duration
		// TODO: is it possible to determine the language of the video?
		// TODO: separate some of these into separate files
		// TODO: separate some of these into separate modules
		// TODO: find a way to not have to manually bootstrap angular
		// 		 maybe we can just let the google loading signal a global flag or something, or maybe a $scope variable to watch?
		//		 to test this I bet a setInterval could do a funny trick, gapi wasn't recognized before
		//		 or maybe thiere is a way to listen, or set an event off when its loaded
		// TODO: background loaders to the videos...spinners or something, different background
		// TODO: turn updateVideos into a factory
		// TODO: think about the need for a service, for maybe caching different language calls?
		// TODO: hard cache from youtube

		// TODO: flags
		// TODO: make the footer nav a collapsible css/html module
		// TODO: ng-include for these partials, so we don't have to see that blink. views, you know?
		// TODO: see why it isn't playing on iPhone
		// TODO: autoplay does not work with these videos on mobile...keep this in mind
		//		 setting this into an interval supposedly works
		//		 or cueVideoById(id)
		//		 its something where videos can't autoplay. we might have to show a video (opacity 0) with an overlay to get the user to click it and
		//		 interact with it. this might not work for continuous playlist play though...desktop is fine
		// TODO: highlight current playing item ALWAYS
		// TODO: what to do in the case of youtube not allowing it?
		// TODO: what to do when we get to end of list
		// TODO: colors
		// TODO: css hide, or template ng-include

});

// app.directive('youTubeEmbed', function ($sce) {
// 	return {
// 		restrict: 'E',
// 		replace: true,
// 		template: '<iframe src="{{ url }}" frameborder="0" allowfullscreen id="video"></iframe>',
// 		link: function (scope, element, attrs) {
// 			scope.$watch('v', function (value) {
// 				scope.url = $sce.trustAsResourceUrl("http://www.youtube.com/embed/" + attrs.v + '?enablejsapi=1');
// 			});
// 		}
// 	};
// });

// app.factory('JsonService', function ($resource) {
// 	return $resource('playlist.json');
// });
//using $resource here is creating a problem
// the problem was due to not physically loading the add on "ng-resource", i guess $http comes out of the box

app.factory('JsonService', function ($http) {
	return {
		someFunc: function () {
			return $http.get('playlist.json');
		}
	};
});

app.factory('SearchVideos', function () {
	return { // After the API loads, call a function to enable the search box.			
		search: function (q) { // Search for a specified string.
			var request = gapi.client.youtube.search.list({
				q: q,
				part: 'snippet',
				type: 'video',
				regionCode: 'FR', // region code
				hl: 'fr_FR', // for text responses, what language should be used
				maxResults: 8
			});

			return request;
		}
	};
});
