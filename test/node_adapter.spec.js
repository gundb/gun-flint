import { describe, it, beforeEach } from 'mocha';
import assert from 'assert';
import { NodeAdapter } from './../src/index'; 
import testData from './test_data';

const put = testData.default.put;
const get = testData.default.get;
const union = testData.default.union;

describe('NodeAdapter: interface spec', function () {

    it('should pass the each node and its key during `put`', done => {
        
        let handled = 0;
        let adapter = new NodeAdapter({
            get: (key, getDone) => {

                // Tell Flint nothing is found to union.
                getDone(null, null);
            },
            put: (key, node, putDone) => {                
                assert.deepStrictEqual(node, put.put[key]);
                assert.equal(true, typeof putDone === 'function');
                
                // Ensure that all nodes are put before calling `done`
                handled++;
                if (handled === Object.keys(put.put).length) {
                    done();
                }
                
            }
        });
        adapter.Gun = require('gun/gun');
        adapter._write(put);
    });

    it('should request an entire node', done => {
        let adapter = new NodeAdapter({
            get: (key, getDone) => {
                assert.deepStrictEqual(key, get.fullNode.get['#']);
                assert.equal(true, typeof getDone === 'function');
                done();
            }
        });
        adapter._read(get.fullNode);
    });

    it('should request a single node field in the same manner as a `key` field', done => {
        let adapter = new NodeAdapter({
            get: (key, getDone) => {
                assert.deepStrictEqual(key, get.field.get['#']);
                assert.equal(true, typeof getDone === 'function');
                done();
            }
        });
        adapter._read(get.field);
    });

    it('should union an existing node before making a put request', done => {
        
        // setup and condition
        let handled = 0;
        let adapter = new NodeAdapter({
            get: (key, getDone) => {
                getDone(null, union[key]);
            },
            put: (key, node, putDone) => {
                assert.deepStrictEqual(node, adapter._union(union[key], put.put[key]));
                
                // Ensure that all nodes are put before calling `done`
                handled++;
                if (handled === Object.keys(put.put).length) {
                    done();
                }
            }
        });
        adapter.bootstrap(require('gun/gun'));

        // run
        adapter._write(put);
    });

});