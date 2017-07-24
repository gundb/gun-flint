# Delta Adapter

The Delta adapter provides the lowest level functionality and greatest flexibility. `Put`s are sent as deltas of the current node. Ensure that you properly handle merging in the delta received during write so that you don't overwrite existing node data.

```javascript
import {Flint, DeltaAdapter} from 'gun-flint';

Flint.register(new DeltaAdapter({

    /**
     * Send data back into Gun. Return as a valid Gun object
     *
     * You can do anything you like with the delta for storage purposes, 
     * but you must return to data to gun in the format that Gun recognizes.
     *
     * NOTE: the second parameter `field`, if supplied, indicates that a specific node
     *       field is requested; if empty, then an entire node is requested.
     *
     * @param {string}   key     The UUID for the node to retrieve
     * @param {string}   [field] If supplied, a specific field to retrieve; if not supplied, get full node
     * @param {callback} done    Callback after retrieval is finished
     */
    get: function(key, field, done) {
        retrieveData(key, field).then((err, node) => {
            done(err, node);
        });
    },

    /**
     * Write data into storage/service from Gun.
     *
     * Note that the delta parameter is NOT a full node but
     * only a diff that is produced at time of `put` request.
     * 
     * !Warning! Treating the delta as a full node can result in data loss!!
     * 
     * @param {string}   key    The UUID for the node request
     * @param {object}   delta  Node with metadata (required)
     * @param {function} done   Call after operation finishes
     */
    put: function(key, delta, done) {
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