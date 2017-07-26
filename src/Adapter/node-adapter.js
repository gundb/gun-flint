import Gun from 'gun/gun';
import Util from './../util';
import BaseAdapter from './base-adapter';
import AdapterContext from './adapter-context';


/**
 * Read/write hooks for the node adapter
 *
 * @private
 * @param {object} adapter - A plain object with adapter methods
 * @class
 */
export default class Adapter extends BaseAdapter {

  /**
   * @override
   * @instance
   * @public
   * 
   * @param {string}   key      the node key 
   * @param {string}   [field]  the field requested, if applicable
   * @param {callback} done     Call after read completed
   */
  get(key, field, done) {
    this._get(key, (err, result) => {
      if (result && field) {
        result = Gun.state.to(result, field);
      }
      done(err, result);
    });
  }

  /**
   *  @param {Object|String}   result    - A Gun node; or stringified Gun node
   *  @param {Function}        callback - Call once read finished
   *  @return {void}
   */
  read(result, done) {
    result = Gun.text.is(result) ? JSON.parse(result) : result;
    done(null, result);
  }

  /**
   *  @param {Object}   delta    - A delta for the current node
   *  @param {Function} callback - Called once write finished
   *  @return {void}
   */
  write(delta, done) {
    const keys = Object.keys(delta);

    /**
    * @param  {Error} [err] - An error given by get request
    * @returns {undefined}
    */
    function writeHandler (err, key, node, existing) {

      // Merge the delta with existing node
      let errorOk = !err || err.code() === 400;
      if (errorOk && node && existing) {  
        node = Util.union(node, existing);
      }

      // Write merged node to storage
      if (node && Gun.obj.is(node)) {
        this._put(key, node, done);
      }
    }

    // Each node in the delta...
    keys.forEach(key => {

      // First retrieve existing node in order to union
      this._get(key, (err, existing) => {
          let nodeDelta = delta[key];
          writeHandler.call(this, err, key, nodeDelta, existing);
      });
    }, this);
  }
}
