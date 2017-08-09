module.exports = function(finished, Adapter, opt) {
    const path = require('path');
    const Mocha = require('mocha');
    const fs = require('fs');

    // Essential opt setup
    opt = opt || {};
    opt.file = false;
    
    // Set a few globals (can this be done another way??)
    global.Gun = require('gun/gun');
    Adapter.bootstrap(global.Gun);
    global.Adapter = Adapter;
    global.opt = opt;
    global.data = require('./data');

    // Ensure unique identity for this test run.
    global.keyBase = Date.now() + "";    
    global.getKey = (suffix) => {
        return `${keyBase}_${suffix}`;
    }

    // An easy way to re-create gun as needed
    global.getGun = function() {
        return new Gun(opt);
    }


    // Log warning
    console.info("You are about to run an integration test suite against your adapter. If this is linked to a storage layer, it WILL write records to that storage layer.");


    // Instantiate a Mocha instance.
    var mocha = new Mocha();

    let testDir = path.join(__dirname, 'suite/');

    // Add each .js file to the mocha instance
    fs.readdirSync(testDir).filter(function(file){
        // Only keep the .js files
        return file.substr(-3) === '.js';

    }).forEach(function(file) {
        mocha.addFile(
            path.join(testDir, file)
        );
    });

    // Run the tests.
    let runner = mocha.run();

    /*
    *   - `start`  execution started
    *   - `end`  execution complete
    *   - `suite`  (suite) test suite execution started
    *   - `suite end`  (suite) all tests (and sub-suites) have finished
    *   - `test`  (test) test execution started
    *   - `test end`  (test) test completed
    *   - `hook`  (hook) hook execution started
    *   - `hook end`  (hook) hook complete
    *   - `pass`  (test) test passed
    *   - `fail`  (test, err) test failed
    *   - `pending`  (test) test pending
    */
    runner.on('end', () => {
        finished();
    });
    // .on('start', () => {
    //     console.log('TESTING STARTED');
    // })
    
    // .on('pass', test => {
    //     console.log('.');
    // })
    // .on('fail', (test) => {
    //     console.log('F');
    // })
    // .on('suite end', suite => {
    //     console.log("INTEGRATION SUITE FINISHED");
    // });
}