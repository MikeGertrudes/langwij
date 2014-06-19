// overlay, modal
var overlayDirective = angular.module('OverlayDirective', []);

overlayDirective.directive('overlay', function () {
	return {
		restrict: 'E',
		scope: {},
		templateUrl: 'inc/overlay-directive/overlay-directive.html',
		replace: true,
		transclude: true,
		link: function (scope, element) {}
	};
});