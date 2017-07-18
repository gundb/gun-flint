# Node Adapter

The Node adapter is the easiest to use but is the least efficient. It is best suited for document-based (i.e., JSON-like) storage, such as MongoDB or Postgres.

```javascript
import {Flint, NodeAdapter} from 'gun-flint';

Flint.register(new NodeAdapter({

    /**
     * Send data back into Gun. Return the node just as it was given to store
     *
     * You can do anything you like with it for storage purposes as long as it
     * is returned to gun in a format that Gun recognizes.
     *
     * @param {string}   key   The UUID for the node to retrieve
     * @param {callback} done  Callback after retrieval is finished
     */
    get: function(key, done) {
        retrieveData(key).then((err, node) => {
            done(err, node);
        });
    },

    /**
     * Write data into storage/service from Gun.
     * 
     * @param {string}   key   The UUID for the node request
     * @param {object}   node  Node with metadata (required)
     * @param {function} done  Call after operation finishes
     */
    put: function(key, node, done) {
        writeData(key, node, done).then(err => {
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
See an example implementation here with Mongo: (gun-mongo)[https://github.com/sjones6/gun-mongo].