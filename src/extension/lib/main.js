var prefs = require("sdk/simple-prefs").prefs;
var pageMod = require("sdk/page-mod");
var Request = require("sdk/request").Request;
var self = require("sdk/self");
var clipboard = require("sdk/clipboard");
var ss = require("sdk/simple-storage");
var priv = require("sdk/private-browsing");
var utils = require("sdk/window/utils");
var events = require("sdk/system/events");
var { ActionButton } = require("sdk/ui/button/action");
var tabs = require("sdk/tabs");

const {Cc, Ci, Cu, Cr} = require("chrome");

if (!ss.storage) {
  ss.storage = {};
}

if (!ss.storage.lang) {
  var locale = Cc["@mozilla.org/chrome/chrome-registry;1"].getService(Ci.nsIXULChromeRegistry).getSelectedLocale('global');
  ss.storage.lang = locale;
}

var button = ActionButton({
  id: "imgbi",
  label: "img.bi",
  icon: {
    '16': './icons/favicon-16x16.png',
    '32': './icons/favicon-32x32.png',
    '36': './icons/favicon-36x36.png',
    '64': './icons/favicon-64x64.png'
  },
  onClick: function(state) {
    tabs.open(self.data.url('index.html'));
  }
});

// redirect everything to local page
exports.main = function() {
  events.on('http-on-modify-request', listener);
};

exports.onUnload = function (reason) {
  events.off('http-on-modify-request', listener);
};

function listener(event) {
  var regexp = new RegExp(prefs.url.replace(/^http?s:\/\//, '^http?s:\/\/') + '\/(.*)');
  var regexp_except = new RegExp(prefs.url.replace(/^http?s:\/\//, '^http?s:\/\/') + '\/(download|api|key.gpg)(.*)');
  var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  var url = event.subject.URI.spec;
  var url_test = regexp.exec(url);
  var url_except = regexp_except.test(url);
  if (url_test && !url_except) {
    channel.cancel(Cr.NS_BINDING_ABORTED);
    var gBrowser = utils.getMostRecentBrowserWindow().gBrowser;
    var domWin = channel.notificationCallbacks.getInterface(Ci.nsIDOMWindow);
    var browser = gBrowser.getBrowserForDocument(domWin.top.document);
    browser.loadURI(self.data.url('index.html') + url_test[1]);
  }
}

pageMod.PageMod({
  include: self.data.url('index.html') + '*',
  contentScriptFile: self.data.url('communicate.js'),
  contentScriptWhen: 'ready',
  onAttach: pageCommunicate
});

// communicate with content script (which will communicate with page script)
function pageCommunicate(worker) {
  worker.port.on('copy', function(data) {
    clipboard.set(data);
  });
  
  worker.port.on('downloadFile', function(id) {
    Request({
      url: prefs.url + '/download/' + id,
      onComplete: function (response) {
        if (response.status == 404) {
          delete ss.storage[id];
        }
        worker.port.emit('fileContent' + id, {content: response.text, status: response.status});
      }
    }).get();
  });
  
  worker.port.on('downloadThumb', function(id) {
    Request({
      url: prefs.url + '/download/thumb/' + id,
      onComplete: function (response) {
        if (response.status == 404) {
          delete ss.storage[id];
        }
        worker.port.emit('thumbContent' + id, {content: response.text, status: response.status});
      }
    }).get();
  });
  
  worker.port.on('remove', function(data) {
    Request({
      url: prefs.url + '/api/remove',
      content: {id: data.id, password: data.rmpass},
      onComplete: function (response) {
        if (response.status == 200 && response.json && response.json.status == 'Success') {
          delete ss.storage[data.id];
          worker.port.emit('fileRemoved' + data.id, true);
        }
        else if (response.json && response.json.status) {
          worker.port.emit('fileRemoved' + data.id, response.json.status);
        }
        else {
          worker.port.emit('fileRemoved' + data.id, response.text);
        }
        
      }
    }).get();
  });
  
  worker.port.on('upload', function(data) {
    Request({
      url: prefs.url + '/api/upload',
      content: {thumb: data.ethumb, encrypted: data.encrypted, expire: data.expire},
      onComplete: function (response) {
        if (response.status == 200 && response.json.status == 'OK') {
          worker.port.emit('uploadedFile' + data.pseudoid, {id: response.json.id, rmpass: response.json.pass});
        }
        else if (response.json && response.json.status) {
          worker.port.emit('uploadedFile' + data.pseudoid, {err: response.json.status });
        }
        else {
          worker.port.emit('uploadedFile' + data.pseudoid, {err: response.text });
        }
      }
    }).post();
  });
  
  worker.port.on('removeStorage', function(id) {
    delete ss.storage[id];
  });
  
  worker.port.on('setStorage', function(data) {
    if(!priv.isPrivate(worker)) {
      ss.storage[data.id] = data.value;
    }
  });
  
  worker.port.on('getStorage', function(id) {
    worker.port.emit('storageContent' + id, ss.storage[id]);
  });
  
  worker.port.on('getFullStorage', function() {
    worker.port.emit('fullStorageContent', JSON.stringify(ss.storage));
  });
  
  worker.port.on('getUrl', function() {
    worker.port.emit('url', prefs.url);
  });
  
}
