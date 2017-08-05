import BaseExtension from './../base-extension';
import AdapterContext from './adapter-context';
import BaseMixin from './../Mixin/base-mixin';
import Util from './../util';

/**
 * The base class for all adapters
 * 
 * Children must, at a minimum extend two methods:
 * 
 * <code>
 * <ul>
 *  <li>read: handle results from a `get`</li>
 *  <li>write: handle a `put` request</li>
 * </ul>
 * </code>
 * 
 * Additionally, the following methods can be overwritten:
 * 
 * <code>
 * <ul>
 *  <li>get</li>
 *  <li>afterRead</li>
 *  <li>afterWrite</li>
 * </ul>
 * </code>
 * 
 * Here is the flow through the BaseAdapter for a `get` and `put`:
 * 
 * Gun.on('get') -> _read -> get -> _get [Adapter does work] -> read -> afterRead
 * Gun.on('put') -> _write -> write -> _put [Adapter does work] -> afterWrite
 * 
 * @class
 * @extends BaseExtension
 */
export default class BaseAdapter extends BaseExtension {

    /* lifecyle */

    /**
     * Build the adapter. This takes an object as its only parameter.
     * 
     * @param {object} adapter 
     */
    constructor(adapter) {
        super();
        this.outerContext = AdapterContext.make(this);

        // Bind the three adapter methods to the `this` context
        this._opt = adapter.opt ? adapter.opt.bind(this.outerContext) : Util.noop;
        this._get = adapter.get ? adapter.get.bind(this.outerContext) : Util.noop;
        this._put = adapter.put ? adapter.put.bind(this.outerContext) : Util.noop;

        // Bind all adapter methods to the outer context
        for (let methodName in adapter) {
            if ({}.hasOwnProperty.call(adapter, methodName)
                && ['opt', 'get', 'put', 'on'].indexOf(methodName === -1)
                ) {
                if (typeof adapter[methodName] === 'function') {
                    this.outerContext[methodName] = adapter[methodName].bind(this.outerContext);
                } else {
                    this.outerContext[methodName] = adapter[methodName];
                }
            }
        }

        // Prepare a dedupid hash
        this.__dedupIds = {};

        // Bind context for read and write methods
        // These receive context from Gun when they are called
        this._read = this._read.bind(this);
        this._write = this._write.bind(this);

        // Apply Mixins
        if (adapter.mixins && adapter.mixins.length) {
            adapter.mixins.forEach(mixin => {
                if (mixin && mixin.prototype instanceof BaseMixin) {
                    new mixin(this);
                }
            });
        }

        // finish
        return this;
    }

    /* public */

    /**
     * Bootstrap the adapter. Flint calls this method when the adapter is registered
     * 
     * @instance
     * @public
     * 
     * @public
     */
    bootstrap() {
        this.Gun = require('gun/gun');

        if (!this.Gun) {
            throw "Unable to retrieve a Gun instance. This is probably because you tried to import Gun after this Gun adapter. Makes sure that you import all adapter after you've imported Gun.";
        }

        var _this = this;
        this.Gun.on('opt', function(context) {
            this.to.next(context);
            _this.opt(context);

            if (context.once) {
                return;
            }

            // Allows other plugins to respond concurrently.
            const pluginInterop = (middleware) => function (context) {
                this.to.next(context);
                return middleware(context);
            };

            // Register the driver.
            context.on('get', pluginInterop(_this._read));
            context.on('put', pluginInterop(_this._write));
        });

        return this.Gun;
    }
    
    /**
     * Handle Gun `opt` event
     * 
     * @instance
     * @public
     * 
     * @param {object} context   The gun context firing the event 
     * 
     * @returns {void}
     */
    opt(context) {
        this.context = context;
        this._opt(context, context.opt || {}, !(!context.once));
    }

    /**
     * Handle a read result from an adapter.
     * 
     * @instance
     * @public
     * 
     * @param {mixed} context   Results from adapter read
     * @param {done}  callback  Callback to call with err, results as params
     * 
     * @returns {void}
     */
    read(results, done) {
        throw "Adapter implementations must extend the `read` method";
    }

    /**
     * Pass a write event to the adaper; formatting if necessary
     * 
     * @public
     * @instance
     * 
     * @param {object} delta    A Gun write-delta
     * @param {done}  callback  Callback to call with err (if any) as param
     * 
     * @returns {void}
     */
    write(delta, done) {
        throw "Adapter implementations must extend the `write` method";
    }

    /**
     * Pass the results of a read request into Gun
     * 
     * @param {string} dedupId  Dedup ID passed by Gun during read request
     * @param {Error}  [err]    Error (if any) that occured during read   
     * @param {object} data     A node formatted in a reconizable format for Gun
     * 
     * @returns {void}
     */
    afterRead(dedupId, err, data) {
        this._recordGet(dedupId);
        this.context.on('in', {
            '@': dedupId,
            put: this.Gun.graph.node(data),
            err
        });
    }

    /**
     * Pass the results of a read request into Gun
     * 
     * @public
     * @instance
     * 
     * @param {string} dedupId  Dedup ID passed by Gun during read request
     * @param {Error}  [err]    Error (if any) that occured during read   
     * 
     * @returns {void}
     */
    afterWrite(dedupId, err) {
        
        // Report whether it succeeded.
        this.context.on('in', {
            '@': dedupId,
            ok: !err,
            err,
        });
    }

    /**
     * @instance
     * @public
     * 
     * @param {string}   key   The UUID for the node to retrieve
     * @param {string}  [field]   If supplied, get a single field; otherwise full node is requested
     * @param {callback} done  Callback after retrieval is finished
     */
    get(key, field, done) {
        this._get(key, field, done);
    }

    /* private api */

    /**
     * Handle Gun 'get' events
     * 
     * @instance
     * @private
     * 
     * @param  {Object} context - A gun request context.
     * @returns {void}
     */
    _read(context) {
        const { '#': dedupId, get } = context;
        const { '#': key } = get;

        // When field === '_', the entire node
        // is requested; otherwise, the property
        // name is used. Flint will simply pass
        // null if entire node is requested.
        const field = get['.'] !== '_' ? get['.'] : null;

        // Read from adapter.
        const _this = this;
        return this.get(key, field, (err, result) => {

            // Error handling.
            if (err) {
                if (err.code() === this.outerContext.errors.codes.lost) {

                    // Tell gun nothing was found.
                    this.afterRead(dedupId, null, null);
                } else {
                    this.afterRead(dedupId, err, null);
                }
            } else {
                
                // Pass the result to child implementations
                // Children should know how to handle results
                // And return a valid GUN object
                _this.read(result, this.afterRead.bind(_this, dedupId));
            }
        });
    }

    /**
     * Handle Gun 'put' events
     * 
     * @instance
     * @private
     * 
     * @param {object} context  Gun write context
     */
    _write(context) {
        const { put: delta, '#': dedupId } = context;

        // Filter out returns from the `get` requests
        if (this._shouldWrite(context['@'])) {
            // Pass to child implementation
            return this.write(delta, this.afterWrite.bind(this, dedupId));
        }
    }

    /**
     * Check the dedup hash to ensure that anything that was 
     * just pulled from the adapter is passed back in as a write
     * 
     * @instance
     * @private
     * 
     * @param {string} dedupId  The request dedup
     * @return {boolean}        Whether or not the `PUT` linked to this dedupid should be written
     */
    _shouldWrite(dedupId) {
        if (!dedupId) {
            return true;
        }

        let readCount = 0;
        if (this.__dedupIds[dedupId]) {
            readCount = this.__dedupIds[dedupId];
            this.__dedupIds[dedupId]--;
            if (this.__dedupIds[dedupId] === 0) {
                delete this.__dedupIds[dedupId];
            }
        }
        return readCount < 1;
    }

    /**
     * Every get should record its dedupId during retrieval in the hash.
     * 
     * @instance
     * @private
     * 
     * @param {string} dedupId 
     */
    _recordGet(dedupId) {
        if (!this.__dedupIds[dedupId]) {
            this.__dedupIds[dedupId] = 0;
        }
        this.__dedupIds[dedupId]++;
    }
}