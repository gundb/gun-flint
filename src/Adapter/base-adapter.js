import AdapterContext from './adapter-context';
import BaseMixin from './../Mixin/base-mixin';
import Gun from 'gun/gun';


export default class BaseAdapter {

    constructor(adapter) {
        this.outerContext = AdapterContext.make(this);

        this._opt = adapter.opt ? adapter.opt.bind(this.outerContext) : Util.noop;
        this._get = adapter.get ? adapter.get.bind(this.outerContext) : Util.noop;
        this._put = adapter.put ? adapter.put.bind(this.outerContext) : Util.noop;

        for (let methodName in adapter) {
            if ({}.hasOwnProperty.call(adapter, methodName)
                && ['opt', 'get', 'put', 'patch', 'on'].indexOf(methodName === -1)
                ) {
                if (typeof adapter[methodName] === 'function') {
                    this.outerContext[methodName] = adapter[methodName].bind(this.outerContext);
                } else {
                    this.outerContext[methodName] = adapter[methodName];
                }
            }
        }

        // Bind context for read and write methods
        // These receive context from Gun when they are called
        this._read = this._read.bind(this);
        this._write = this._write.bind(this);

        if (adapter.mixins && adapter.mixins.length) {
            adapter.mixins.forEach(mixin => {
                if (mixin && mixin.prototype instanceof BaseMixin) {
                    new mixin(this);
                }
            })
        }

        return this;
    }

   /**
    * Handle Gun `opt` event
    * 
    * @param {gun} context   The gun context firing the event 
    * 
    * @returns {void}
    */
    opt(context) {
        this.context = context;
        this._opt(context, context.opt || {});
    }

    read(context) {
        throw "Adapter implementations must extend this method";
    }

    /**
     * @param  {Object} context - A gun request context.
     * @returns {void}
     */
    _read(context) {
        const { '#': dedupId, get } = context;
        const { '#': key } = get;

        const done = (err, data) => this.context.on('in', {
            '@': dedupId,
            put: Gun.graph.node(data),
            err
        });

        // Read from adapter.
        const _this = this;
        return this._get(key, (err, result) => {

            // Error handling.
            if (err) {
                if (err.code() === this.outerContext.errors.codes.lost) {

                    // Tell gun nothing was found.
                    done(null);
                } else {
                    done(err);
                }
                return;
            } else {
                
                // Pass the result to child implementations
                // Children should know how to handle results
                // And return a valid GUN object
                _this.read(result, done);
            }
        });
    }

    write(delta, done) {
        throw "Adapter implementations must extend this method";
    }

    /**
     *  @param {object} context  Gun write context
     */
    _write(context) {
        const { put: delta, '#': uuid } = context;

        // Done handler
        const done = (err = null) => {
            // Report whether it succeeded.
            this.context.on('in', {
                '@': uuid,
                ok: !err,
                err,
            });
        }
        // Pass to child implementation
        return this.write(delta, done);
    }
}