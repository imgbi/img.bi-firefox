module.exports = function(grunt) {
grunt.initConfig({
  "mozilla-addon-sdk": {
    '1_17': {
      options: {
        revision: "1.17",
        dest_dir: "addon_sdk/"
      }
    }
  },
  "mozilla-cfx-xpi": {
    stable: {
      options: {
        "mozilla-addon-sdk": "1_17",
        extension_dir: ".tmp/ext",
        dist_dir: ".",
        arguments: "--strip-sdk" // builds smaller xpis
      }
    }
  },
  less: {
    production: {
      options: {
        paths: ['bower_components/bootstrap/less']
      },
      files: {
        '.tmp/main.css': 'bower_components/img.bi/src/less/main.less'
      }
    }
  },
  "mozilla-cfx": {
    run: {
      options: {
        "mozilla-addon-sdk": "1_17",
        extension_dir: ".tmp/ext",
        command: "run"
      }
    }
  },
  copy: {
    ext: {
      expand: true,
      src: '**',
      cwd: 'src/extension',
      dest: '.tmp/ext/'
    },
    partials: {
      cwd: 'bower_components/img.bi/src/partials',
      src: '**',
      expand: true,
      dest: '.tmp/ext/data/partials/'
    },
    index: {
      src: 'bower_components/img.bi/src/index.html',
      dest: '.tmp/ext/data/index.html'
    }
  },
  clean: ['.tmp'],
  webfont: {
    icons: {
      src: [
        'bower_components/awesome-uni.font/src/svg/spinner.svg',
        'bower_components/awesome-uni.font/src/svg/mail.svg',
        'bower_components/awesome-uni.font/src/svg/key.svg',
        'bower_components/awesome-uni.font/src/svg/github-circled.svg',
        'bower_components/awesome-uni.font/src/svg/spinner.svg',
        'bower_components/awesome-uni.font/src/svg/twitter.svg',
        'bower_components/awesome-uni.font/src/svg/link.svg'
      ],
      dest: '.tmp/ext/data/font',
      destCss: '.tmp',
      options: {
        hashes: false,
        syntax: 'bootstrap',
        htmlDemo: false,
        relativeFontPath: '../font',
      }
    }
  },
  concat: {
    js: {
      src: [
        'bower_components/angular/angular.min.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-gettext/dist/angular-gettext.min.js',
        'bower_components/angular-strap/dist/modules/dimensions.min.js',
        'bower_components/angular-strap/dist/modules/modal.min.js',
        '.tmp/config.js',
        '.tmp/translations.js',
        'bower_components/sjcl/sjcl.js',
        'bower_components/img.bi/src/scripts/app.js',
        'bower_components/img.bi/src/scripts/controllers.js',
        'bower_components/img.bi/src/scripts/directives.js',
        'bower_components/img.bi/src/scripts/filters.js',
        'bower_components/img.bi/src/scripts/services.js',
        'src/scripts/clipboard.js',
        'src/scripts/storage.js',
        'src/scripts/webservices.js'
      ],
      dest: '.tmp/ext/data/scripts/main.js'
    },
    css: {
      src: ['.tmp/main.css', '.tmp/icons.css'],
      dest: '.tmp/ext/data/css/main.css'
    }
  },
  ngconstant: {
    web: {
      options: {
        dest: '.tmp/config.js',
        name: 'imgbi.config'
      },
      constants: {
        config: grunt.file.readJSON('bower_components/img.bi/config.json')
      }
    }
  },
  nggettext_compile: {
    all: {
      files: {
        '.tmp/translations.js': ['bower_components/img.bi/src/locales/*.po']
      }
    },
  },
  jshint: {
    scripts: ['Gruntfile.js', 'src/scripts/*.js', 'src/extension/data/*.js'],
    ext: {
      options: {
        moz: true
      },
      files: {
        src: ['src/extension/lib/main.js']
      }
    }
  },
  jsonlint: {
    all: {
      src: [ 'package.json', 'bower.json', 'src/extension/package.json' ]
    }
  },
  multiresize: {
    main: {
      src: 'bower_components/img.bi/logo.svg',
      dest: [
        '.tmp/ext/data/icons/favicon-196x196.png',
        '.tmp/ext/data/icons/favicon-160x160.png',
        '.tmp/ext/data/icons/favicon-96x96.png',
        '.tmp/ext/data/icons/favicon-16x16.png',
        '.tmp/ext/data/icons/favicon-32x32.png',
        '.tmp/ext/data/icons/favicon-36x36.png',
        '.tmp/ext/data/icons/favicon-48x48.png',
        '.tmp/ext/data/icons/favicon-64x64.png',
      ],
      destSizes: [
        '196x196',
        '160x160',
        '96x96',
        '16x16',
        '32x32',
        '36x36',
        '48x48',
        '64x64'
      ]
    }
  }
});


grunt.loadNpmTasks('grunt-mozilla-addon-sdk');
grunt.loadNpmTasks('grunt-contrib-copy');
grunt.loadNpmTasks('grunt-contrib-clean');
grunt.loadNpmTasks('grunt-contrib-less');
grunt.loadNpmTasks('grunt-angular-gettext');
grunt.loadNpmTasks('grunt-ng-constant');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-webfont');
grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-jsonlint');
grunt.loadNpmTasks('grunt-multiresize');

grunt.registerTask('default', [ 'xpi' ]);
grunt.registerTask('xpi', [ 'copy', 'multiresize', 'less', 'ngconstant', 'nggettext_compile', 'webfont', 'concat', 'mozilla-addon-sdk', 'mozilla-cfx-xpi', 'clean']);
grunt.registerTask('run', [ 'copy', 'multiresize', 'less', 'ngconstant', 'nggettext_compile', 'webfont', 'concat', 'mozilla-addon-sdk', 'mozilla-cfx:run', 'clean' ]);
grunt.registerTask('test', ['jshint', 'jsonlint']);
};
