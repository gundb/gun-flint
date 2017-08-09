
const assert = require('assert');

describe("Flint Integration Suite:", function() {
    describe("-- GET --", function() {

        // Set default timeout
        this.timeout(2000);

        let gun;
        beforeEach(() => {
            gun = getGun();
        });

        it("should return acknowledge when no data is found", function(done) {
            gun.get('key that does not exist').val(node => {
                assert.strictEqual(node, undefined);
                done();
            });
        });

        it("should read a flat node from storage", function(done) {
            let focus = data.focus;
            let key = getKey(focus.key);

            let target = Object.keys(focus.val).length;

            let $focus = gun.get(key).put(focus.val, ack => {
                let gun = getGun();
                gun.get(key).on(storedFocus => {
                    delete storedFocus._;
                    if (target === Object.keys(storedFocus).length) {
                        assert.deepStrictEqual(storedFocus, focus.val);
                        done();
                    }
                });
            });
        });


        it("should navigate to and read a node deep", function(done) {
            // setup
            let focus = data.focus;
            let ford = data.ford;
            let focusKey = getKey(focus.key);
            let fordKey = getKey(ford.key);
            let target = Object.keys(ford.val).length;

            let $focus = gun.get(focusKey);
            let $ford = gun.get(fordKey);
            $ford.put(ford.val);
            $focus.get('make').put($ford);
            
            setTimeout(() => {
                getGun().get(focusKey).get('make').on(val => {
                    delete val._;
                    if (Object.keys(val).length === target) {
                        assert.deepStrictEqual(val, ford.val);
                        done();
                    }
                });
            }, 500);
        });
    });
});
