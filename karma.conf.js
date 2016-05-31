// Karma configuration

module.exports = function (config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',

    // testing frameworks to use
    frameworks: ['mocha', 'chai', 'sinon'],

    // list of files / patterns to load in the browser. order matters!
    files: [
      // jquery source
      'Client/lib/jquery/dist/jquery.js',
      
      // angular source
      'Client/lib/angular/angular.js',
      'Client/lib/angular-route/angular-route.js',
      'Client/lib/angular-mocks/angular-mocks.js',
      
      // Additional sources
      'Client/lib/moment/min/moment.min.js',
      'Client/lib/moment/min/locales.min.js',
      'Client/lib/humanize-duration/humanize-duration.js',
      'Client/lib/angular-timer/dist/angular-timer.min.js',
      
      // socket io?
      
      // our app code
      'Client/app/**/*.js',
      'Client/auth/**/*.js',
      'Client/services/**/*.js',

      // our spec files - in order of the README
      'specs/Client/test.js'
    ],
    
    // web server port
    port: 9876,

    // test results reporter to use
    reporters: ['nyan'],

    // start these browsers. PhantomJS will load up in the background
    browsers: ['PhantomJS'],

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // if true, Karma exits after running the tests.
    singleRun: true

  });
};
