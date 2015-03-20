angular.module('imgbi.storage', [])
  .factory('removeStorage', [function() {
    return function(id) {
      communicate.removeStorage(id);
    };
  }])
  .factory('setStorage', [function() {
    return function(id, value) {
      communicate.setStorage(id, value);
    };
  }])
  .factory('getStorage', ['$q', function($q) {
    return function(id) {
      var deferred = $q.defer();
      communicate.getStorage(id, function(data) {
        deferred.resolve(data);
      });
      return deferred.promise;
    };
  }])
  .factory('getFullStorage', ['$q', function($q) {
    return function() {
      var deferred = $q.defer();
      communicate.getFullStorage(function(data) {
        deferred.resolve(JSON.parse(data));
      });
      return deferred.promise;
    };
  }])
  .factory('getUrl', ['$q', function($q) {
    return function() {
      var deferred = $q.defer();
      communicate.getUrl(function(url) {
        deferred.resolve(url);
      });
      return deferred.promise;
    };
  }]);
