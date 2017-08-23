
const assert = require('assert');

describe('Flint Integration Suite:', function() {

    // Set default timeout
    this.timeout(4000);

    let gun;
    beforeEach(() => {
        gun = getGun();
    });

    describe("-- PUT -- ", function() {

        // Write Data
        it("should write data and acknowledge the write success", function(done) {
            let node = data.civic;
            gun.get(getKey(node.key)).put(node.val, ack => {
                assert.equal(true, !ack.err);
                done();
            });
        });

        it("should write a nested object", function(done) {
            let civic = data.civic;
            let honda = data.honda;
            civic.val.make = honda.val;
            gun.get(getKey(civic.key)).put(civic, ack => {
                assert.equal(true, !ack.err);
                done();
            });
        });

        it("should write all value types", function(done) {
            let node = data.z4;
            gun.get(getKey(node.key)).put(node.val, ack => {
                assert.equal(true, !ack.err);
                done();
            });
        });

        it("should write relationships", function(done) {
            let focus = data.focus;
            let ford = data.ford;
            let focusKey = getKey(focus.key);
            let fordKey = getKey(ford.key);
            var $focus = gun.get(focusKey)
            let $ford = gun.get(fordKey);

            $focus.put(focus.val);
            $ford.put(ford.val);

            let $make = getGun().get(focusKey).get('make');
            $make.put($ford);

            let target = Object.keys(ford.val).length;
            let finished = false;
            setTimeout(function() {
                getGun().get(focusKey).get('make').on(make => {
                    delete make._;
                    if (!finished && Object.keys(make).length === target) {
                        assert.deepStrictEqual(make, ford.val);
                        finished = true;
                        done();
                    }
                });
            }, 10);
        });

        it("should create sets", function(done) {

            // Nodes
            let germany = data.germany,
                vw = data.vw,
                bmw = data.bmw;

            // Keys
            let germanyKey = getKey(germany.key),
                vwKey = getKey(vw.key),
                bmwKey = getKey(bmw.key);

            // Gun refs
            let $vw = gun.get(vwKey);
            let $bmw = gun.get(bmwKey);
            let $germany = gun.get(germanyKey);

            // Write data  and set
            $germany.put(germany.val);
            $vw.put(vw.val);
            $bmw.put(bmw.val);

            // Run test
            var count = 0;
            var finished = false;
            var vwTarget = Object.keys(vw.val).length;
            var bmwTarget = Object.keys(bmw.val).length;

            let $manufacturers = getGun().get(germanyKey).get('manufacturers');
            $manufacturers.set($vw);
            $manufacturers.set($bmw);
            setTimeout(() => {
                getGun().get(germanyKey).get('manufacturers').map().on((maker, key) => {
                    delete maker._;
                    var makerPropCount = Object.keys(maker).length;
                    if (key === vwKey) {
                        if (makerPropCount === vwTarget) {
                            count++;
                            assert.deepStrictEqual(maker, vw.val);
                        }
                    } else if (key === bmwKey) {
                        if (makerPropCount === bmwKey) {
                            count++;
                            assert.deepStrictEqual(maker, bmw.val);
                        }
                    }

                    if (!finished && count === 1) {
                        finished = true;
                        done();
                    }
                });
            }, 500);        
        });

    });
});