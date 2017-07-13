/* eslint-disable id-length*/
import Gun from 'gun/gun';

function noop() {}

class AdapterErr extends Error {
  constructor(message, code, fileName, lineNumber) {
    super(message, fileName, lineNumber);
    this._code = code;

    this.code = () => {
      return this._code;
    }
  }
}

const errors = {
  codes: {
    lost: 400,
    internal: 500
  },
  lost: new AdapterErr("Key not found", 400),
  internal: new AdapterErr("Internal adapter err", 500)
}

/* eslint-disable */
const union = function union(vertex, node, opt){
	if(!node || !node._){ return }
	vertex = vertex || Gun.state.to(node);
	if(!vertex || !vertex._){ return }
	opt = Gun.num.is(opt)? {machine: opt} : {machine: Gun.state()};
	opt.union = Gun.obj.copy(vertex); // Slow performance.
	if(!Gun.node.is(node, function(val, key){
		var HAM = Gun.HAM(opt.machine, Gun.state.is(node, key), Gun.state.is(vertex, key, true), val, vertex[key]);
		if(!HAM.incoming){ return }
		Gun.state.to(node, key, opt.union);
	})){ return }
	return opt.union;
}
/* eslint-enable */

/**
 *  Construct the context used for adapter methods.
 *  The design intention to expose only methods needed
 *  but still be able to reference the adater
 *  
 *  @param {Adapter} adapter   Adapter instance
 * 
 *  @return {object} A plain object that will serve as context for the client methods
 */
function clientContext(adapter) {
  return {
    on: (ev, callback) => {
      if (adapter.context) {
        adapter.context.on(ev, function(gun) {
          this.to.next(gun);
          callback(gun);
        });
      }
    },
    errors
  }
}

/**
 * Read/write hooks for Gun.
 *
 * @private
 * @param {object} adapter - A plain object with adapter methods
 * @class
 */
export default class Adapter {

  constructor (adapter) {

    const outerContext = clientContext(this);

    this._opt = adapter.opt ? adapter.opt.bind(outerContext) : noop;
    this._get = adapter.get ? adapter.get.bind(outerContext) : noop;
    this._put = adapter.put ? adapter.put.bind(outerContext) : noop;

    for (let methodName in adapter) {
      if ({}.hasOwnProperty.call(adapter, methodName)
          && ['opt', 'get', 'put', 'on'].indexOf(methodName === -1)
        ) {
          if (typeof adapter[methodName] === 'function') {
            outerContext[methodName] = adapter[methodName].bind(outerContext);
          } else {
            outerContext[methodName] = adapter[methodName];
          }
      }
    }

    // Preserve the `this` context for read/write calls.
    this.read = this.read.bind(this);
    this.write = this.write.bind(this);
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

  /**
   * Read a key from LevelDB.
   *
   * @param  {Object} context - A gun request context.
   * @returns {void}
   */
  read (context) {
    const { get, gun } = context;
    const { '#': key } = get;

    const done = (err, data) => gun._.root.on('in', {
      '@': context['#'],
      put: Gun.graph.node(data),
      err,
    });

    // Read from level.
    return this._get(key, (err, result) => {

      // Error handling.
      if (err) {
        if (err.code() === errors.codes.lost) {

          // Tell gun nothing was found.
          done(null);
          return;
        }

        done(err);
        return;
      }

      // Pass gun the result.
      done(null, result);
    });
  }

  /**
   * Write a every node in a graph to level.
   *
   * @param  {Object} context - A gun write context.
   * @returns {void}
   */
  write (context) {
    const { put: graph, gun } = context;
    const keys = Object.keys(graph);
    let merged = 0;

   /**
    * Report errors and clear out the in-process write cache.
    *
    * @param  {Error} [err] - An error given by level.
    * @returns {undefined}
    */
    function writeHandler (err = null, uid, node, existing) {

      // Done handler
      function done(err = null) {
        // Report whether it succeeded.
        gun._.root.on('in', {
          '@': context['#'],
          ok: !err,
          err,
        });
      }

      if (!err && node && existing) {
        node = union(node, JSON.parse(existing.val));
      }
      if (node) {
        this._put(uid, node, done);
      }
    }

    // Each node in the graph...
    keys.forEach((uid) => {
      let node = graph[uid];
      this._get(uid, (err, existing) => {
        writeHandler.call(this, err, uid, node, existing);
      });
    }, this);

  }

}
