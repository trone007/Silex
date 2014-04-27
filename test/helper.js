// docs:
// * https://code.google.com/p/selenium/source/browse/javascript/webdriver/webdriver.js
// * http://selenium.googlecode.com/git/docs/api/javascript/namespace_webdriver.html

var fs = require('fs')
, path = require('path');

/**
 * ref to selenium driver
 */
exports.driver = null;
exports.webdriver = null;

/**
 * start Silex server once
 */
var silexServer = require('../dist/server/server.js');
console.log('-----');
console.log('Silex start');
console.log('-----');
silexServer.setDebugMode(true);

/**
 * check if we will be able to start selenium driver
 * @return  true if it's ok
 */
exports.checkParams = function () {
  if (exports.getDriverName() !== null){
    return true;
  }
  return false;
}


/**
 * get the driver name from the input params
 * @return  the driver name (phantomjs, firefox...)
 */
exports.getDriverName = function () {
    // get command line args to det which driver to call
    var driverName = null;
    for (var i in process.argv){
        var val = process.argv[i];
        if (val == '-firefox'){
            driverName = 'firefox';
        }
        else if (val == '-chrome'){
            driverName = 'chrome';
        }
        else if (val == '-phantomjs'){
            driverName = 'phantomjs';
        }
    }
    return driverName;
}


/**
 * create the webdriver client
 */
exports.createClient = function (webdriverjs) {

    var rootPath = path.resolve(__dirname, '..');
    var phantomjsPath = rootPath + '/node_modules/phantomjs/bin/phantomjs';

    var driverName = exports.getDriverName();
    if (driverName){

    if (driverName==='firefox'){
      // with firefox (which must be installed)
    }
    else if (driverName==='chrome'){
      if (!fs.existsSync(rootPath+'/chromedriver')) throw new Error('Chrome driver for selenium is needed in '+rootPath);
    }

    var client = webdriverjs.remote({
      desiredCapabilities: {
        browserName: driverName
        , 'phantomjs.binary.path': phantomjsPath
      }
    });

    client.on('error',function(e) {
      //console.error('an error occured in the client connected to the selenium server')
      if (e && e.err && e.err.code){
        switch(e.err.code) {
          case 'ECONNREFUSED':
            console.error("couldn't connect to selenium server, please run the command: \n $ java -jar test/selenium-server-standalone-2.37.0.jar");
          break;
          case 'NOSESSIONID':
             // session not available
             // ...
          break;
        }
      }
    });
    return client;
  }
  console.error('You are supposed to call grunt with param \'-firefox\', \'-chrome\' or \'-phantomjs\'. Canceling tests.');
  return null;
}


/**
 * start selenium driver
 * @param        cbk         callback which takes the selenium driver in param
 *
exports.startSelenium = function (cbk) {
    if (exports.driver){
            console.warn('selenium already started, restart');
            exports.stopSelenium(function () {
                exports.startSelenium(cbk);
            });
            return;
    }
    // get command line args to det which driver to call
    var driverName = exports.getDriverName();
    // start selenium
    exports.webdriver = require('selenium-webdriver'),
        SeleniumServer = require('selenium-webdriver/remote').SeleniumServer;

    if (!fs.existsSync(__dirname+'/selenium-server-standalone-2.37.0.jar')) throw new Error('The standalone Selenium server is needed in '+__dirname+'/selenium-server-standalone-2.37.0.jar');
    var server = new SeleniumServer(__dirname+'/selenium-server-standalone-2.37.0.jar', {
      port: 4444
    });

    server.start();

    // select driver
    var capabilities;
    if (driverName==='phantomjs'){
        var phantomjs = require('phantomjs');

        // with phantom js
        capabilities = exports.webdriver.Capabilities.phantomjs();
        capabilities.set('phantomjs.binary.path', phantomjs.path);
    }
    else if (driverName==='firefox'){
        // with firefox (which must be installed)
        capabilities = exports.webdriver.Capabilities.firefox();
    }
    else if (driverName==='chrome'){
        // with firefox (which must be installed)
        capabilities = exports.webdriver.Capabilities.chrome();
        var exePath = path.resolve(__dirname, '..');
        if (!fs.existsSync(exePath+'/chromedriver')) throw new Error('Chrome driver for selenium is needed in '+exePath);
    }

    // build
    exports.driver = new exports.webdriver.Builder().
        usingServer(server.address()).
        withCapabilities(capabilities).
        build();

    if (cbk) cbk(exports.driver, exports.webdriver);
}
/**
 * stop selenium driver
 * @param        cbk         callback fired after shutdown
 *
exports.stopSelenium = function (cbk) {
        exports.driver.quit().then(function () {
                exports.driver = null;
                if (cbk) cbk();
        });
}
/* */
