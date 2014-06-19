// dots
var dotsDirective = angular.module('DotsDirective', []);

dotsDirective.directive('dots', function () {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'inc/dots-directive/dots-directive.html',
		replace: true,
		transclude: true,
		link: function (scope, element) {}
	};
});