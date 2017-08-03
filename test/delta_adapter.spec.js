import { describe, it, beforeEach } from 'mocha';
import assert from 'assert';
import { DeltaAdapter } from './../src/index'; 
import testData from './test_data';

const put = testData.default.put;
const get = testData.default.get;

describe('DeltaAdapter: interface spec', function () {

    it('should pass the entire node delta during `put`', done => {
        let adapter = new DeltaAdapter({
            put: (delta, putDone) => {
                assert.deepStrictEqual(delta, put.put);
                assert.equal(true, typeof putDone === 'function');
                done();
            }
        });
        adapter._write(put);
    });

    it('should request an entire node', done => {
        let adapter = new DeltaAdapter({
            get: (key, field, getDone) => {
                assert.deepStrictEqual(key, get.fullNode.get['#']);
                assert.equal(field, null);
                assert.equal(true, typeof getDone === 'function');
                done();
            }
        });
        adapter._read(get.fullNode);
    });

    it('should request a single node field', done => {
        let adapter = new DeltaAdapter({
            get: (key, field, getDone) => {
                assert.deepStrictEqual(key, get.field.get['#']);
                assert.equal(field, get.field.get['.']);
                assert.equal(true, typeof getDone === 'function');
                done();
            }
        });
        adapter._read(get.field);
    });

});