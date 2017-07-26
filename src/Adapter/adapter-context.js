import Util from './../util';
import AdapterError from './adapter-error.js';

const errors = {
  codes: {
    lost: 400,
    internal: 500
  },
  lost: new AdapterError("Key not found", 400),
  internal: new AdapterError("Internal adapter err", 500)
}

/**
 *  Construct the context used for adapter methods.
 *  The design intention to expose only methods needed
 *  but still be able to reference the adater
 *  
 *  @param {Adapter} adapter   Adapter instance
 * 
 *  @return {object} A plain object that will serve as context for the client methods
 */
export default {
    make: function(adapter) {
        return {
            on: (ev, callback) => {
                if (adapter.context) {
                    adapter.context.on(ev, function(gun) {
                        this.to.next(gun);
                        callback(gun);
                    });
                }
            },
            toNode: Util.gunify,
            errors
        }
    }
}