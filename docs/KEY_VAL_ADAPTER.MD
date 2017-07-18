# Key:Value Adapter

The Key:Value adapter stores Gun nodes as Key:value pairs (along with some metadata for each node).

```javascript
import {Flint, KeyValAdapter} from 'gun-flint';

Flint.register(new KeyValAdapter({

    /**
     * Send data back into Gun. Return to Flint as an array of objects.
     *
     * These objects contain information for each key:value pair. These
     * could indicate either a relationship with another node in the graph
     * or a simple value.
     *
     * Value:
     * {
     *    key:     "the node key/UUID",
     *    nodeKey: "the key for the property on the node"
     *    val:     "value for this key",
     *    state:   12463461341462
     * }
     *
     * Relationship:
     * {
     *    key:     "the node key/UUID",
     *    nodeKey: "the key for the property on the node"
     *    val:     "value for this key",
     *    rel:     "key to some other node in the graph"
     * }
     * 
     * @param {string}   key   The UUID for the node to retrieve
     * @param {callback} done  Callback after retrieval is finished
     */
    get: function(key, done) {
        retrieveDataRecords(key).then((err, records) => {
            done(err, records);
        });
    },

    /**
     * Write data into storage/service from Gun.
     *
     * The format of the batch of writes is described above
     * 
     * 
     * @param {string}   key    The UUID for the node request
     * @param {array}   batch   Array of objects that contain key:value data
     * @param {function} done   Call after operation finishes
     */
    put: function(key, batch, done) {
        writeData(key, delta, done).then(err => {
            done(err);
        });
    },

    /**
     * @param {object}   context   The Gun database context
     * @param {object}   opt       Any options passed when initializing Gun or calling `gun.opt`
     */
    opt: function(context, opt) {
        // Initialize the adapter; e.g., create database connection
    }
}))

```