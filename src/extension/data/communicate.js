var communicate = {
  copy: function (data) {
    self.port.emit('copy', data);
  },
  upload: function (ethumb, encrypted, expire, answer) {
    var pseudoid = pseudoRandomString(10); // some hack to handle multi file upload
    self.port.emit('upload', {ethumb: ethumb, encrypted: encrypted, expire: expire, pseudoid: pseudoid});
    self.port.once('uploadedFile' + pseudoid, function(msg) {
      if (msg.err) {
        answer(msg.err);
      }
      else {
        answer(null, msg.id, msg.rmpass);
      }
    });
  },
  remove: function (id, rmpass, answer) {
    self.port.emit('remove', {id: id, rmpass: rmpass});
    self.port.once('fileRemoved' + id, function(msg) {
      answer(msg);
    });
  },
  downloadFile: function (id, answer) {
    self.port.emit('downloadFile', id);
    self.port.once('fileContent' + id, function(msg) {
      answer(msg.status, msg.content);
    });
  },
  downloadThumb: function (id, answer) {
    self.port.emit('downloadThumb', id);
    self.port.once('thumbContent' + id, function(msg) {
      answer(msg.status, msg.content);
    });
  },
  removeStorage: function (id) {
    self.port.emit('removeStorage', id);
  },
  setStorage: function (id, value) {
    self.port.emit('setStorage', {id: id, value: value});
  },
  getStorage: function (id, answer) {
    self.port.emit('getStorage', id);
    self.port.once('storageContent' + id, function(msg) {
      answer(msg);
    });
  },
  getFullStorage: function (answer) {
    self.port.emit('getFullStorage');
    self.port.once('fullStorageContent', function(msg) {
      answer(msg);
    });
  },
  getUrl: function (answer) {
    self.port.emit('getUrl');
    self.port.once('url', function(msg) {
      answer(msg);
    });
  }
};

unsafeWindow.communicate = cloneInto(communicate, unsafeWindow, {cloneFunctions: true});

function pseudoRandomString(length) {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}
