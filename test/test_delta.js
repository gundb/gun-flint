import {Flint, DeltaAdapter, Util} from './../dist/index';

Flint.register(new DeltaAdapter({
    opt: function(context, option) {
        this.mem = option.mem;
    },
    get: function(key, field, done) {
        console.log({key, field, done});
        this.mem.get(key, (err, res) => {
            if (!err && !res || err && /(NotFound|not found|not find)/i.test(err.message)) {
                done(this.errors.lost)
            } else if (err) {
                done(this.errors.internal);
            } else {
                done(null, res);
            }
        });
    },
    put: function(delta, done) {
        Object.keys(delta).forEach(key => {
            let node = delta[key];
            this.get(key, (err, res) => {
                if (res) {
                    node = Util.union(node, JSON.parse(res))
                }
                this.mem.put(node, JSON.stringify(delta), done);
            });
        });
    }
}));