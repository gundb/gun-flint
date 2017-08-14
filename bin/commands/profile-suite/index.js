module.exports = function(finished, args, Adapter, opt) {
    const path = require('path');
    const Mocha = require('mocha');
    const fs = require('fs');
    const assert = require('assert');

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

    // Ensure unique identity for this test run.
    let keyBase = Date.now() + "";
    let keyChain = {};    


    // An easy way to re-create gun as needed
    let getGun = function() {
        return new Gun(opt);
    }

    let getNode = function() {
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

    let key = function(base) {
        let key = {};
        key.base = base;

        key.make = function(suffix) {
            return `${key.base}_${suffix}`;
        }
        return key;
    }

    let ack = function(desc, target, done) {
        let ack = {};

        ack.desc = desc;
        ack.target = target;
        ack.count = 0;
        ack.start = Date.now();

        ack.ack = function() {
            ack.count++;

            if (ack.count === ack.target) {
                ack.done();
            } 
        };

        ack.done = function() {
            let ms = Date.now() - ack.start;
            console.log(`${ack.desc}: ${ms}ms; ${ms/1000}s; ${ms/target} ms/node.`);
            done();
        }

        return ack;
    }

    // Write 10K nodes
    let profileWrite = function() {
        let $gun = getGun();
        let target = 10000;
        let res = ack(`Write ${target} nodes: `, target, profileRead);
        let ring = key(keyBase);
        for (var i = 0; i < target; i++) {
            $gun.get(ring.make(i)).put(getNode(), res.ack);
        }
    }

    // Write 10K nodes
    let profileRead = function() {
        let $gun = getGun();
        let target = 10000;
        let res = ack(`Read ${target} nodes: `, target, upsert);
        let ring = key(keyBase);
        let node = getNode();
        let nodeKeys = Object.keys(node);
        for (var i = 0; i < target; i++) {
            $gun.get(ring.make(i)).on(val => {
                if (Object.keys(val).length === nodeKeys.length) {
                    res.ack();
                }
            });
        }
    }

    // Update 10K nodes
    let upsert = function() {
        let $gun = getGun();
        let target = 10000;
        let res = ack(`Update ${target} nodes: `, target, allDone);
        let ring = key(keyBase);
        for (var i = 0; i < target; i++) {
            $gun.get(ring.make(i)).put(getNode(), res.ack);
        }
    }

    // Read 10K node fields
    // let readFields = function() {
    //     let $gun = getGun();
    //     let target = 10000;
    //     let res = ack(`Read ${target} nodes: `, target, allDone);
    //     let ring = key(keyBase);
    //     let node = getNode();
    //     for (var i = 0; i < target; i++) {
    //         $gun.get(ring.make(i)).get('six').on(val => {
    //             if (val.six === 'six') {
    //                 res.ack();
    //             }
    //         });
    //     }
    // }

    let allDone = function() {
        console.log("Profile finished");
        finished();
    }

    profileWrite();

}