import BaseAdapter from './base-adapter';
import Util from './util';
import Gun from 'gun/gun';

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
        if (result && result instanceof Array && result.length) {
            result = Util.gunify(result[0].key, result);
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
        keys.forEach(nodeKey => {
            let nodeDelta = delta[nodeKey];
            const conflictState = nodeDelta._['>'];
            const batch = Object.keys(nodeDelta).map(key => {
                if (key !== '_') {
                    let state = conflictState[key];
                    let node = { state, key };
                    if (Gun.obj.is(nodeDelta[key])) {
                        node.rel = nodeDelta[key]['#'];
                    } else {
                        node.val = nodeDelta[key]; 
                    }
                    return node;
                }
            }).filter(node => node);

            if (batch && batch.length) {
                this._put(nodeKey, batch, done);
            }
        }, this);
    }
}