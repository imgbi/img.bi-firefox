angular.module('imgbi.webservices', [])
  .factory('downloadFile', ['$q', function($q) {
    return function(id) {
      var deferred = $q.defer();
      communicate.downloadFile(id, function(status, content) {
        console.log(status);
        console.log(content);
        if (status == 200) {
          deferred.resolve(content);
        }
        else {
          deferred.reject({text: content, status: status});
        }
      });
      return deferred.promise;
    };
  }])
  .factory('downloadThumb', ['$q', function($q) {
    return function(id) {
      var deferred = $q.defer();
      communicate.downloadThumb(id, function(status, content) {
        if (status == 200) {
          deferred.resolve(content);
        }
        else {
          deferred.reject({text: content, status: status});
        }
      });
      return deferred.promise;
    };
  }])
  .factory('removeFile', ['$q', function($q) {
    return function(id, rmpass) {
      var deferred = $q.defer();
      communicate.remove(id, rmpass, function(status) {
        if (status === true) {
          deferred.resolve(true);
        }
        else {
          deferred.reject(status);
        }
      });
      return deferred.promise;
    };
  }])
  .factory('uploadFile', ['$q', function($q) {
    return function(ethumb, encrypted, expire) {
      var deferred = $q.defer();
      communicate.upload(ethumb, encrypted, expire, function(err, id, rmpass) {
        if (err) {
          deferred.reject(err);
        }
        else {
          deferred.resolve({
            id: id,
            rmpass: rmpass
          });
        }
      });
      return deferred.promise;
    };
  }]);
