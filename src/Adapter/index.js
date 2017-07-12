/* eslint-disable id-length*/
import Gun from 'gun/gun';
const writing = Symbol('In-process writes');
const notFound = /(NotFound|not found|not find)/i;
const options = {
  valueEncoding: 'json',
};

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

function noop() {}

/**
 * Read/write hooks for Gun.
 *
 * @private
 * @param {LevelUP} level - A LevelUP interface.
 * @class
 */
export default class Adapter {

  constructor (adapter) {

    this.opt = adapter.opt || noop;
    this.get = adapter.get || noop;
    this.put = adapter.put || noop;

    // Preserve the `this` context for read/write calls.
    this.read = this.read.bind(this);
    this.write = this.write.bind(this);
  }

  /**
   * Read a key from LevelDB.
   *
   * @param  {Object} context - A gun request context.
   * @returns {undefined}
   */
  read (context) {
    const { get, gun } = context;
    const { level } = this;
    const { '#': key } = get;

    const done = (err, data) => gun._.root.on('in', {
      '@': context['#'],
      put: Gun.graph.node(data),
      err,
    });

    const value = level[writing][key];
    if (value) {
      return done(null, value);
    }

    // Read from level.
    return this.get(key, options, (err, result) => {

      // Error handling.
      if (err) {
        if (err.code === 400) {

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
   * @returns {undefined}
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
    function writeHandler (err = null) {

      // Report whether it succeeded.
      gun._.root.on('in', {
        '@': context['#'],
        ok: !err,
        err,
      });
    }

    // Each node in the graph...
    keys.forEach((uid) => {
      let node = graph[uid];
      const value = {}; // todo

      // Check to see if it's in the process of writing.
      if (value) {
        node = union(node, value);
        merged += 1;
        
        this.put(node);
      }
    });

  }

}
