var acceptedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'],
maxSize = 3145728,
upload_button = document.getElementById('upload-button'),
input = document.getElementById('input');

upload_button.onclick = function() {
  sjcl.random.startCollectors();
  input.click();
  input.onchange = function() {
    encrypt(input.files);
  };
}

function randomString(length) {
  var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  i,
  result = '',
  values = sjcl.random.randomWords(length);
  for(i=0; i<length; i++) {
    result += charset[values[i].toString().replace('-','') % charset.length];
  }
  return result;
}

function encrypt(files) {
  for (var i = 0; i < files.length; i++) {
    if (acceptedTypes.indexOf(files[i].type) != '-1') {
      if (files[i].size < maxSize) {
        var reader = new FileReader();
        reader.onload = function (event) {
          var pass = randomString(40),
          encrypted = sjcl.encrypt(pass, event.target.result, {ks:256});
          self.port.emit('upload',encrypted,pass);
        };
        reader.readAsDataURL(files[i]);
      }
      else {
        self.port.emit('error','filesize');
      }
    }
    else {
      self.port.emit('error','filetype');
    }
  }
}
