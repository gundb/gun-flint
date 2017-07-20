# Key:Value Adapter

The Key:Value adapter stores Gun nodes as Key:value pairs (along with some metadata for each node).

## Basic Usage (no streaming)

```javascript
import {Flint, KeyValAdapter} from 'gun-flint';

Flint.register(new KeyValAdapter({

    /**
     * Send data back into Gun. Return to Flint as an array of objects or a single object
     * following the schemas below.
     *
     * These objects contain information for each key:value pair. Each object
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


## Streaming Results

You can stream results back to gun-flint. This is critical for result sets that might not fit in memory, which could easily happen if you have extremely large nodes.

The example below assumes that you have stored each key:value (+ metadata) as separate rows/documents in your storage system. When a request comes in for a certain node, you retrieve all of the key:value pairs back to Flint as you receive them. Flint, in turn, formats the key:value with the metadata and streams it into gun.

See [`gun-mysql`](https://github.com/sjones6/gun-mysql/blob/master/src/index.js#L77) for an example of streaming.

Note: Flint will be integrating more support for read and write streams and so the streaming API may change.

```javascript
Flint.register(new KeyValAdapter({

    /**
     * All of the above applies for formatting of object.
     * 
     * @param {string}   key   The UUID for the node to retrieve
     * @param {callback} done  Callback after retrieval is finished
     */
    get: function(key, done) {
        const stream = this.getDataStreamFromStorage(key);

        let streamErr = null;
        let receivedResults = false;
        steam
            .on('error', err => {

                // Catch the err, retun when steam closes on `end` event
                streamErr = this.errors.internal;
            })
            .on('result', result => {
                receivedResults = true;

                // Steam back each result to Flint
                done(null, result);
            })
            .on('end', () => {

                // Stream returned an error at some point. send internal err
                if (streamErr) {
                    done(streamErr);

                // No results found before end event; send 404
                } else if (!receivedResults) {
                    done(this.errors.lost);
                }
            });
    },
}))

```