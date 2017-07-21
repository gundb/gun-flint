import BaseAdapter from './Adapter/base-adapter';
import DeltaAdapter from './Adapter/delta-adapter';
import KeyValAdapter from './Adapter/key-val-adapter';
import NodeAdapter from './Adapter/node-adapter';
import Plugin from './Plugin';
import Util from './Adapter/util';
import Gun from 'gun/gun';

// Bundles Mixins
import BaseMixin from './Mixin/base-mixin';
import ResultStreamMixin from './Mixin/ResultStreamMixin';


/**
 * @listens {Gun.opt}
 * @listens {Gun.get}
 * @listens {Gun.put}
 * 
 * @param {BaseAdapter} adapter - The
 * @return {void}
 */
function bootstrapAdapter(adapter) {

  if (!Gun) {
    throw "Unable to retrieve a Gun instance. This is probably because you tried to import Gun after this Gun plugin. Makes sure that you import all plugins after you've imported Gun.";
  }

  Gun.on('opt', function(context) {
    this.to.next(context);
    adapter.opt(context);

    // Allows other plugins to respond concurrently.
    const pluginInterop = (middleware) => function (context) {
      this.to.next(context);
      return middleware(context);
    };

    // Register the driver.
    context.on('get', pluginInterop(adapter._read));
    context.on('put', pluginInterop(adapter._write));
  });
}


/**
 * @todo
 */
function bootstrapExtension(extension) {
}


const flint = {
  register: function(extension = null) {
    if (!extension) {
      throw "Flint.register requires an instance of either Flint.Adapter or Flint.Plugin";
    }

    if (extension instanceof BaseAdapter) {
      bootstrapAdapter(extension)
    } else if (extension instanceof Plugin) {
      bootstrapExtension(extension);
    } else {
      throw "Attempting to register an unsupported Gun extension with Flint. Flint.register requires an instance of either Flint.Adapter or Flint.Plugin";
    }
  },
  DeltaAdapter,
  NodeAdapter,
  KeyValAdapter,
  Plugin,
  Util,
  BaseMixin,
  Mixins: {
    BaseMixin,
    ResultStreamMixin
  },
  NOT_FOUND: 400,
};
flint.Flint = flint;

module.exports = flint;
