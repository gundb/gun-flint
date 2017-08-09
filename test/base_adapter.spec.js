// Base Adapter
const AdapterError = require('./../src/Adapter/adapter-error');
const BaseAdapter = require('./../src/Adapter/base-adapter');

// Testing
const assert = require('assert');
const testData = require('./test_data');
const put = testData.default.put;
const get = testData.default.get


describe('BaseAdapter: options', function () {
    
    it("should save the context during an opt event", function(done) {
        let adapter = new BaseAdapter.default({});
        let options = {
            one: true
        };
        adapter.opt(options);
        assert.deepStrictEqual(adapter.context, options);
        done();
    });

    it("should call _opt with 3 parameters", function(done) {
        let options = {
            one: true,
            opt: 'options'
        };
        
        let adapter = new BaseAdapter.default({
            opt: function(context, opt, once) {
                assert.deepStrictEqual(context, options);
                assert.equal(opt, options.opt);
                assert.equal(false, once);
                done();
            }
        });

        adapter.opt(options);
        
    });

});

describe('BaseAdapter: dedup writes after gets', function () {

    it('should register the dedupId on read', done => {
        
        // setup / mock a successful read flow
        let adapter = new BaseAdapter.default({});
        adapter.get = (key, field, getDone) => {
            getDone(null, put.put.node1);
        }
        adapter.read = (result, doneProcessing) => {
            doneProcessing(null, result); // > afterRead
        };
        adapter.context = {
            on: function() {}
        }

        // condition 
        adapter._recordGet = (dedupId, err, result) => {
            assert.equal(dedupId, get.fullNode['#']);
            done();
        };

        // run
        adapter._read(get.fullNode);
    });

    it('should not allow something with registered dedup to be written', done => {

        // setup state
        let adapter = new BaseAdapter.default({});
        adapter.write = () => {
            throw "PUT has been called even though it would allow a duplicate to be written";
        };
        adapter.context = {
            on: function() {}
        };
        adapter._recordGet(put['@']);
        adapter._recordGet(put['@']);
        adapter._write(put);
        adapter._write(put);

        // Finish as long as no error thrown
        done();
    });

    it('should allow something without registered dedup to be written', done => {
        // prepare
        let adapter = new BaseAdapter.default({});
        adapter.context = {
            on: function() {}
        };
        let writeAttempts = 0;
        adapter._recordGet('some_random_dedup');
        adapter._recordGet(put['@']);

        // Conditions
        adapter.write = (delta) => {
            writeAttempts++;
            assert.equal(1, writeAttempts);
            assert.deepStrictEqual(delta, put.put)
        };
        
        // this should be filtered out
        adapter._write(put);

        // this should succeed
        adapter._write(put);

        // finish
        done();
    });

});

describe('BaseAdapter: get', function () {
    it('should pass key and done callback when getting a whole node', done => {
        let adapter = new BaseAdapter.default({});
        adapter.get = (key, field, getDone) => {
            assert.equal(key, get.fullNode.get['#']);
            assert.equal(field, null);
            assert.equal(true, typeof getDone === 'function');
            done();
        }
        adapter._read(get.fullNode);
    });
    
    it('should pass key, field, and done callback when getting only a field', done => {
        let adapter = new BaseAdapter.default({});
        adapter.get = (key, field, getDone) => {
            assert.equal(key, get.field.get['#']);
            assert.equal(field, get.field.get['.']);
            assert.equal(true, typeof getDone === 'function');
            done();
        }
        adapter._read(get.field);
    });

    it('should call afterRead with the dedup id and adapter err', done => {
        
        // setup
        let adapter = new BaseAdapter.default({});
        let adapterErr = new AdapterError.default('contrived error');
        adapter.get = (key, field, getDone) => {
            getDone(adapterErr);
        }

        // condition
        adapter.afterRead = (dedupId, err, result) => {
            assert.equal(dedupId, get.fullNode['#']);
            assert.equal(err, adapterErr);
            assert.equal(result, undefined);
            done();
        };

        // run
        adapter._read(get.fullNode);
    });

    it('should call `read` and `afterRead` with the dedupId and result on success', done => {
        
        // setup
        let adapter = new BaseAdapter.default({});
        adapter.get = (key, field, getDone) => {
            getDone(null, put.put.node1);
        }

        // condition 1
        adapter.read = (result, doneProcessing) => {
            assert.deepStrictEqual(result, put.put.node1);
            assert.equal(typeof doneProcessing === 'function', true);
            doneProcessing(null, result); // > afterRead
        };

        // condition 2
        adapter.afterRead = (dedupId, err, result) => {
            assert.equal(dedupId, get.fullNode['#']);
            assert.equal(err, null);
            assert.deepStrictEqual(result, put.put.node1);
            done();
        };

        // run
        adapter._read(get.fullNode);
    });
});


describe('BaseAdapter: put', function () {
    it('should pass the `put` context to the child adapters write method', done => {
        // setup
        let adapter = new BaseAdapter.default({});

        // condition
        adapter.write = (delta, writeDone) => {
            assert.deepStrictEqual(delta, put.put);
            assert.equal(typeof writeDone === 'function', true);
            done();
        }

        // run
        adapter._write(put);
    });

    it('should pass any write error and the dedupId into Gun', done => {

        // setup
        let adapter = new BaseAdapter.default({});
        let putError = new AdapterError.default('contrived put error');
        adapter.write = (delta, writeDone) => {
            writeDone(putError);
        }

        // condition
        adapter.context = {
            on: (event, ack) => {
                assert.equal(ack.err, putError);
                assert.equal(ack['@'], put['#']);
                done();
            }
        }

        // run
        adapter._write(put);
    });

    it('should pass no error and dedupId on successful write', done => {

        // setup
        let adapter = new BaseAdapter.default({});
        adapter.write = (delta, writeDone) => {
            writeDone(null);
        }

        // condition
        adapter.context = {
            on: (event, ack) => {
                assert.equal(ack.err, null);
                assert.equal(ack['@'], put['#']);
                done();
            }
        };

        // run
        adapter._write(put);
    });
});
