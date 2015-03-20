angular.module('imgbi.clipboard', [])
  .directive('copy', function() {
    return {
      restrict: 'AE',
      link: function($scope, $element) {
        $element.bind('click', function(event) {
          communicate.copy($element.attr('data-clipboard-text'));
        });
      }
    };
  });
