import BaseAdapter from './base-adapter';
import Util from './../util';

export default class KeyValAdapter extends BaseAdapter {

    /**
     *  @param {Array|Object}    result    - An array of objects (= records) like so
     *                               {
     *                                  key: 'uuid for the node'
     *                                  nodeKey: 'node value's name'
     *                                  val:     'Value'
     *                                  rel:     'Relationship (if referring to another node)
     *                                  state:   'conflict resolution value'
     *                               }
     *  @param {Function} callback - Call once read finished
     *  @return {void}
     */
    read(result, done) {
        if (result) {
            const key = result instanceof Array && result.length ? result[0].key : result.key;
            result = Util.gunify(key, result);
        }
        done(null, result);
    }

    /**
     *  @param {Object}   delta    - A delta for the current node
     *  @param {Function} callback - Called once write finished
     *  @return {void}
     */
    write(delta, done) {
        const keys = Object.keys(delta);

        // Batch together key:val writes
        const batch = [];

        // Iterate through each node in the delta
        keys.forEach(key => {
            let nodeDelta = delta[key];
            const conflictState = nodeDelta._['>'];

            // Iterate through each field in the node delta
            Object.keys(nodeDelta).map(field => {

                // Ignore meta info
                if (field !== '_') {
                    let state = conflictState[field];

                    // base node
                    let node = { state, field, key };

                    // Add rel or val
                    if (this.Gun.obj.is(nodeDelta[field])) {
                        node.rel = nodeDelta[field]['#'];
                    } else {
                        node.val = nodeDelta[field]; 
                    }
                    batch.push(node);
                }
            });
        }, this);

        // Write batch
        if (batch.length) {
            this._put(batch, done);
        }
    }
}