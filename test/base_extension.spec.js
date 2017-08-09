const assert = require('assert');
const AdapterError = require('./../src/Adapter/adapter-error');
const BaseExtension = require('./../src/base-extension');

describe("BaseExtension:", function() {
    describe("the interface", function() {
        it ("should contain a `bootstrap` method", function(done) {
            assert.equal(typeof BaseExtension.default.prototype.bootstrap === 'function', true);
            done();
        });
    });
});