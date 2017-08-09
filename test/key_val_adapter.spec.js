import { describe, it, beforeEach } from 'mocha';
import assert from 'assert';
import { KeyValAdapter } from './../src/index'; 
import testData from './test_data';
import Gun from 'gun/gun';

const put = testData.default.put;
const get = testData.default.get;

describe('KeyValAdapter: interface spec', function () {

    it('should pass a batch array and callback during put', done => {
        
        // setup
        let targetLength = 0;
        Object.keys(put.put).forEach(key => {
            Object.keys(put.put[key]).forEach(propName => {
                if (propName !== '_') {
                    targetLength++;
                }
            });
        });

        // condition
        let adapter = new KeyValAdapter({
            put: (batch, putDone) => {
                assert.equal(batch instanceof Array, true);
                assert.equal(batch.length, targetLength);
                assert.equal(true, typeof putDone === 'function');
                done();
            }
        });
        adapter.Gun = Gun;

        // run
        adapter._write(put);
    });

    it('should pass pass a key when requesting a full node', done => {
    
        // setup and condition
        let adapter = new KeyValAdapter({
            get: (key, field, getDone) => {
                assert.equal(key, get.fullNode.get['#']);
                assert.equal(field, null);
                assert.equal(true, typeof getDone === 'function');
                done();
            }
        });

        // run
        adapter._read(get.fullNode);
    });


    it('should pass pass a key and field when requesting a singled field', done => {
    
        // setup and condition
        let adapter = new KeyValAdapter({
            get: (key, field, getDone) => {
                assert.equal(key, get.field.get['#']);
                assert.equal(field, get.field.get['.']);
                assert.equal(true, typeof getDone === 'function');
                done();
            }
        });

        // run
        adapter._read(get.field);
    });

    it('should restructure a key:val object into a Gun-recognizable node', done => {
    
        // setup
        let results = [];
        let key = get.fullNode.get['#'];

        // Breakdown node into an array of results as they should be returned from an adapter
        let node = put.put[key];
        Object.keys(node).forEach(propName => {
            if (propName !== '_' && propName) {
                results.push({
                    key,
                    field: propName,
                    val: node[propName],
                    state: node._['>'][propName]
                });
            }
        });

        let adapter = new KeyValAdapter({
            get: (key, field, getDone) => {
              getDone(null, results);   
            }
        });

        // condition: when inserting into Gun it should again look like the node
        adapter.afterRead = (dedupId, err, formattedResults) => {
            assert.deepStrictEqual(formattedResults, node);
            done();
        };

        // run
        adapter._read(get.fullNode);
    });

    it('should restructure a key:val object into a Gun-recognizable node for a single field', done => {
    
        // setup
        let node;
        let getResults = (key, field) => {
            let results = [];
            node = put.put[key];

            // Breakdown node into an array of results as they should be returned from an adapter
            Object.keys(node).forEach(propName => {
                if (propName === field) {
                    results.push({
                        key,
                        field: propName,
                        val: node[propName],
                        state: node._['>'][propName]
                    });
                }
            });
            return results;
        };
        let adapter = new KeyValAdapter({
            get: (key, field, getDone) => {
              getDone(null, getResults(key, field));   
            }
        });

        // condition: when inserting into Gun it should again look like the node
        adapter.afterRead = (dedupId, err, formattedResults) => {
            assert.deepStrictEqual(formattedResults, node);
            done();
        };

        // run
        adapter._read(get.field);
    });

});
