const {NodeAdapter} = require('./../../src/index');

module.exports = new NodeAdapter({
    opt: function(context, option) {
        this.mem = option.mem;
    },
    get: function(key, done) {
        this.mem.get(key, (err, res) => {
            if (!err && !res || err && /(NotFound|not found|not find)/i.test(err.message)) {
                done(this.errors.lost)
            } else if (err) {
                done(this.errors.internal);
            } else {
                done(null, JSON.parse(res));
            }
        });
    },
    put: function(key, node, done) {
        this.mem.put(key, JSON.stringify(node), done);
    }
});