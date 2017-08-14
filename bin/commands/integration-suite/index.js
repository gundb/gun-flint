module.exports = function(finished, args, Adapter, opt) {
    const path = require('path');
    const Mocha = require('mocha');
    const fs = require('fs');

    // Essential opt setup
    opt = opt || {};
    opt.file = false;
    
    const gunPath = args['skip-packaged-gun'] ? 'gun/gun' : './../gun/gun';
    global.Gun = require(gunPath);

    // Gun not found. Error out
    if (!global.Gun) {
        throw "GUN NOT FOUND! Unable to continue integration tests. If using the --skip-packaged-gun flag, be sure that gun is available included in node modules.";
    }

    Adapter.bootstrap(global.Gun);

    // Set a few globals (can this be done another way!?)
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
    runner.on('end', () => {
        finished();
    });
}