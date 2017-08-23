module.exports = function(finished, args, Adapter, opt) {
    const Profiler = require('./Profiler');

    // Essential opt setup
    opt = opt || {};
    
    const gunPath = args['skip-packaged-gun'] ? 'gun/gun' : './../gun/gun.js';
    global.Gun = require(gunPath);

    // Gun not found. Error out
    if (!global.Gun) {
        throw "GUN NOT FOUND! Unable to continue integration tests. If using the --skip-packaged-gun flag, be sure that gun is available included in node modules.";
    }

    Adapter.bootstrap(global.Gun);

    let getSmallNode = function() {
        return {
            one: 'one',
            two: 'two',
            three: 'three',
            four: 'four',
            five: 'five',
            six: 'six',
            seven: 'seven',
            eight: 'eight',
            nine: 'nine',
            ten: 'ten'
        };
    }

    let getMediumNode = function() {
        let node = {};
        let keyPrefix = "prop";
        let val = "medium_property"
        for (var i = 0; i < 1000; i++) {
            node[`${keyPrefix}_${i}`] = val;
        }
        return node;
    };

    let getLargeNode = function() {
        let node = {};
        let keyPrefix = "prop";
        let val = "large_property"
        for (var i = 0; i < 10000; i++) {
            node[`${keyPrefix}_${i}`] = val;
        }
        return node;
    };


    let runMedium = () => {
        if (!args['skip-medium']) {
            let medium = new Profiler("__ Medium Nodes: 1000 Properties Each __", getMediumNode(), 1000);
            medium.run(opt, runLarge);
        } else {
            runLarge();
        }
    }

    let runLarge = () => {
        if (!args['skip-large']) {
            let large = new Profiler("__ Large Nodes: 10000 Properties Each __", getLargeNode(), 100);
            large.run(opt, finished);
        } else {
            finished();
        }
    }

    if (!args['skip-small']) {
        let small = new Profiler("__ Small Nodes: 10 Properties Each __ ", getSmallNode(), 10000);
        small.run(opt, runMedium);
    } else {
        runMedium();
    }

}