#! /usr/bin/env node
var parseArgs = require('minimist');
var argv = parseArgs(process.argv);
var path = require('path');

if (!argv.path) {
    throw "A path to the adapter that you want to test is required!";
}
let Adapter;

var flintOpt = {
    file: false
};
if (argv.opt || argv.opt !== false) {
    var optPath = path.join(process.cwd(), (argv.opt || ''), 'flint-opt.json')
    try {
        flintOpt = require(optPath);
    } catch (e) {
        throw `Unable to find flint options: ${optPath}`;
    }
}

try {
    Adapter = require(path.join(process.cwd(), argv.path));
} catch(e) {
    throw `Unable to find the adapter at path: ${argv.path}`;
}

var Gun = Adapter.bootstrap();

function createGun() {
    return new Gun(flintOpt);
}

function handle(ack, context) {
    if (ack.ok) {
           
    }
}

createGun().get('tester').put({
    val1: 'asdagssd',
    val2: 'adfbawegaw'
}, handle);

// All done
//process.exit();