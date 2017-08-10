const {KeyValAdapter} = require('./../../src/index');

function keyField(key, field) {
    return `${key}_${field}`;
}

module.exports = new KeyValAdapter({
    opt: function(context, option) {
        this.mem = option.mem;
    },
    get: function(key, field, done) {
        if (field) {

            // Get a single field.
            this.mem.get(keyField(key, field), (err, result) => {
                if (!err && !result || err && /(NotFound|not found|not find)/i.test(err.message)) {
                    done(this.errors.lost)
                } else if (err) {
                    done(this.errors.internal);
                } else {
                    done(null, JSON.parse(result));
                }
            })
        } else {

            // Retrieve an entire node. First look up the node's key list
            // and find the keys for all key_fields.
            this.mem.get(key, (err, result) => {
                if (!err && !result || err && /(NotFound|not found|not find)/i.test(err.message)) {
                    done(this.errors.lost)
                } else if (err) {
                    done(this.errors.internal);
                } else {
                    var fieldKeys = result.split(',');
                    fieldKeys.forEach(fieldKey => {
                        this.mem.get(fieldKey, (error, keyVal) => {
                            if (!error && !keyVal || error && /(NotFound|not found|not find)/i.test(error.message)) {
                                done(this.errors.lost)
                            } else if (error) {
                                done(this.errors.internal);
                            } else {
                                done(null, JSON.parse(keyVal));
                            }
                        });
                    });
                }
            });
        }
    },
    put: function(batch, done) {
        let writer = this.mem.batch();

        let keys = {};
        batch.forEach(node => {
            let key = keyField(node.key, node.field);
            writer.put(key, JSON.stringify(node));

            if (!keys[node.key]) {
                keys[node.key] = [];
            }
            keys[node.key].push(key);
        });

        // Write once all nodes processed
        let target = Object.keys(keys).length;
        let count = 0;
        let writeWhenReady = () => {
            count++;
            if (count === target) {
                writer.write(err => {
                    if (err) {
                        done(this.errors.internal)
                    } else {
                        done();
                    }
                });
            }
        }
        
        let mergeKeys = (nodeKey, existing, newKeys) => {
            let merged = existing;
            newKeys.forEach(newKey => {
                if (existing.indexOf(newKey) === -1) {
                    merged.push(newKey);
                }
            });
            writer.put(nodeKey, merged);
            writeWhenReady();
        };

        Object.keys(keys).forEach(nodeKey => {
            this.mem.get(nodeKey, (err, keyList) => {
                keyList = keyList ? keyList.split(',') : [];
                mergeKeys(nodeKey, keyList, keys[nodeKey]);
            });
        });
    }
});