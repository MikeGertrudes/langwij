var app = angular.module('langwij', [
	]);

function googleApiClientReady () {
	gapi.client.setApiKey('AIzaSyBiWFSGUblt1LTX6UxzvKjy5Yiblt6H1gA');
	gapi.client.load('youtube', 'v3', manuallyBootstrapAngular);
}

function manuallyBootstrapAngular () {
	angular.element(document).ready(function() {
		angular.bootstrap(document, ['langwij']);
	});
}

app.controller('langwijController', function ($scope, JsonService, SearchVideos) {

		$scope.languages = ['Choose a language...', 'Spanish', 'French', 'Portuguese'];
		$scope.selectedLanguage = $scope.languages[0]; // Choose a language...


		// if the google youtube api exists, search it, otherwise fallback to static
		if (gapi.length !== 0) {

			updateVideos($scope.selectedLanguage);

		} else {
			// get playlist
			var getPlaylist = JsonService.someFunc();
			getPlaylist.then( function(response) {
				$scope.playlistItems = response.data;
				console.log(response.data);
			});
		}

		// search videos
		function updateVideos (language) {
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
					tmpObject.url = 'https://www.youtube.com/watch?v=' + response.result.items[i].id.videoId;
					tmpObject.v = response.result.items[i].id.videoId;

					// update the tmp array
					tmpArray.push(tmpObject);
				}

				$scope.playlistItems = tmpArray;
				console.log($scope.playlistItems);

				// actually need this for the list to update
				// adding this here makes it work off the bat, on page load
				// commenting it out allows it to work everytime we toggle the dropdown
				// but now, its returning late results, results from the previous drop
				// so there is a delay
				// i see, it could be because it only because an angular app once google returns, which sucks...hmmm
				//$scope.$apply();
			});
		}

		$scope.updateLanguage = function () {
			console.log($scope.selectedLanguage)
			updateVideos($scope.selectedLanguage);
		}

		// TODO: find out how to trigger play with javascript for first video
		// TODO: find out how to find duration
		// TODO: is it possible to determine the language of the video?
		// TODO: separate some of these into separate files
		// TODO: separate some of these into separate modules
		// TODO: find a way to not have to manually bootstrap angular
		// 		 maybe we can just let the google loading signal a global flag or something, or maybe a $scope variable to watch?
		//		 to test this I bet a setInterval could do a funny trick, gapi wasn't recognized before
		//		 or maybe thiere is a way to listen, or set an event off when its loaded
		// TODO: background loaders to the videos...spinners or something, different background
		// TODO: get this into git!
		// TODO: turn updateVideos into a factory
		// TODO: think about the need for a service, for maybe caching different language calls?
		// TODO: hard cache from youtube
});

app.directive('youTubeEmbed', function ($sce) {
	return {
		restrict: 'E',
		replace: true,
		template: '<iframe src="{{ url }}" frameborder="0" allowfullscreen></iframe>',
		link: function (scope, element, attrs) {
			console.log('test v');
			scope.$watch('v', function (value) {
				console.log('test v inside', attrs.v);
				scope.url = $sce.trustAsResourceUrl("http://www.youtube.com/embed/" + attrs.v);
			});
		}
	};
});

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
				maxResults: 10
			});

			return request;
		}
	};
});