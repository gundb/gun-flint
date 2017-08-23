const Ack = require('./Ack');
const KeyRing = require('./KeyRing');

// Ensure unique identity for this test run.
let keyBase;
let keyChain = {};    
let __gun;


let recurse = (target, callback, done) => {
    callback(target, () => {
        if (target === 0) {
            done();
        } else {
            target--;
            recurse(target, callback, done);
        }
    });
};

let sequence = function(target, node, opt, allDone) {
    let ring = new KeyRing(keyBase + "_MEDIUM");

    // An easy way to re-create gun as needed
    let __gun;
    let getGun = function(run) {
        __gun = null;
        __gun = new Gun(opt);
        run(__gun);
    }

    let profileWrite = function() {
        getGun(function($gun) {
            let res = new Ack(`Write ${target} nodes: `);
            recurse(
                target,
                (i, next) => {
                    $gun.get(ring.make(i)).put(node, at => {
                        res.ack(at);
                        next();
                    });
                },
                () => {
                    res.done();
                    profileRead();
                }
            );
        });
    }

    // Write 10K nodes
    let profileRead = function() {
        
        getGun(function($gun) {
            let res = new Ack(`Read ${target} nodes: `);
            let nodeKeys = Object.keys(node);
            recurse(
                target,
                (i, next) => {
                    $gun.get(ring.make(i)).on((val, key, ctx, at) => {
                        // remove metadata
                        delete val._;
                        // Check for node completeness
                        if (Object.keys(val).length === nodeKeys.length) {
                            at.off();
                            res.ack();
                            next();
                        }
                    });
                },
                () => {
                    res.done();
                    upsert();
                }
            );
        });
    }

    // Update 10K nodes
    let upsert = function() {
        getGun(function($gun) {
            let res = new Ack(`Update ${target} nodes: `);
            recurse(
                target,
                (i, next) => $gun.get(ring.make(i)).put(node, at => {
                    res.ack(at);
                    next();
                }),
                () => {
                    res.done();
                    updateSingleProperty();
                }
            );
        });
    }

    // Update 10K nodes
    let updateSingleProperty = function() {
        getGun(function($gun) {
            let res = new Ack(`Update single field on ${target} nodes: `);
            recurse(
                target,
                (i, next) => $gun.get(ring.make(i)).put({one: 'two'}, at => {
                    res.ack(at);
                    next();
                }),
                () => {
                    res.done();
                    allDone();
                }
            );
        });
    }

    // Read 10K node fields
    // let readFields = function() {
    //     getGun($gun => {
    //         let res = new Ack(`Read ${target} nodes: `);
    //         let node = node;
    //         recurse(
    //             target,
    //             (i, next) => {
    //                 let propName = `prop_${i}`;
    //                 $gun.get(ring.make(i)).get(propName).on((val, key, ctx, at) => {
    //                     if (val[propName] === 'medium_property') {
    //                         at.off();
    //                         res.ack();
    //                     }
    //                 });
    //             },
    //             () => {
    //                 res.done();
    //                 allDone();
    //             }
    //         );
    //     });
    // }

    // start the chain
    profileWrite();
}


module.exports = class Profiler {
    constructor(desc, node, target) {
        this.desc = desc;
        this.target = target;
        this.node = node;

        keyBase = Date.now() + "";
    }

    run(opt, done) {
        console.log(this.desc);
        sequence(this.target, this.node, opt, done);
    }
}