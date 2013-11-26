const widget = require('sdk/widget').Widget,
data = require('sdk/self').data,
tabs = require("sdk/tabs"),
Request = require("request").Request,
prefs = require("sdk/simple-prefs").prefs,
notifications = require("sdk/notifications"),
_ = require("sdk/l10n").get,
clipboard = require("sdk/clipboard");
 
var imgbi = widget({
  id: 'imgbi',
  label: 'Upload image to img.bi',
  contentURL: data.url('input.html'),
  contentScriptFile: [data.url('sjcl.js'), data.url('input.js')] 
});

imgbi.port.on('upload', function(encrypted,pass) {
  Request({
    url: prefs.url + '/api/upload',
    content: {encrypted: encrypted},
    onComplete: function (response) {
      var uploaded = JSON.parse(response.text);
      if (uploaded) {
        if (uploaded.status == 'OK') {
          if (prefs.clipboard == true) {
            clipboard.set(prefs.url + '/#!' + uploaded.id + '!' + pass);
          }
          tabs.open(prefs.url + '/#!' + uploaded.id + '!' + pass + '!' + uploaded.pass);
        }
        else {
          notifyError('server_responce', uploaded.status);
        }
      }
      else {
        notifyError('parse');
      }
    }
  }).post();  
});

imgbi.port.on('error', function(error,placeholder) {
  notifyError(error,placeholder);
});

function notifyError(error,placeholder) {
  notifications.notify({
    text: _(error,placeholder),
    iconURL: data.url('imgbi64.png')
  });
  console.log(_(error,placeholder));
}


