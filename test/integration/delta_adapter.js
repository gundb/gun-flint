
const {DeltaAdapter} = require('./../../src/index');
const union = require('./../../src/Adapter/union');

module.exports = new DeltaAdapter({
    opt: function(context, option) {
        this.mem = option.mem;
    },
    get: function(key, field, done) {
        this.mem.get(key, (err, res) => {
            if (!err && !res || err && /(NotFound|not found|not find)/i.test(err.message)) {
                done(this.errors.lost)
            } else if (err) {
                done(this.errors.internal);
            } else {
                let node = JSON.parse(res);
                if (field) {
                    done(null, this.Gun.state.to(node, field));
                } else {
                    done(null, node);
                }
            }
        });
    },
    put: function(delta, done) {
        let count = 0;
        let finished = err => {
            if (err) {
                done(err);
            } else {
                count++;
                if (count = Object.keys(delta).length) {
                    done();
                }
            }
        };

        Object.keys(delta).forEach(key => {
            let node = delta[key];
            this.get(key, null, (err, res) => {
                if (res) {
                    node = union(this.Gun, node, res)
                }
                this.mem.put(key, JSON.stringify(node), finished);
            });
        });
    }
}); 