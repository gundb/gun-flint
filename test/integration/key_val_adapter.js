const {KeyValAdapter} = require('./../../src/index');

module.exports = new KeyValAdapter({
    opt: function(context, option) {
        this.mem = option.mem;
    },
    get: function(key, field, done) {
        if (field) {
            this.mem.get(key, (err, res) => {
                if (!err && !res || err && /(NotFound|not found|not find)/i.test(err.message)) {
                    done(this.errors.lost)
                } else if (err) {
                    done(this.errors.internal);
                } else {
                    done(null, JSON.parse(res));
                }
            });
        } else {
            this.mem.get(key, (err, res) => {
                if (!err && !res || err && /(NotFound|not found|not find)/i.test(err.message)) {
                    done(this.errors.lost)
                } else if (err) {
                    done(this.errors.internal);
                } else {
                    done(null, JSON.parse(res));
                }
            });
        }
    },
    put: function(batch, done) {
        batch.forEach();
        this.mem.put(key, JSON.stringify(node), done);
    }
});