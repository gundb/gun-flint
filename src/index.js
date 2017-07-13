import Adapter from './Adapter';
import Plugin from './Plugin';
import Gun from 'gun/gun';

/**
 * 
 * @param {*} adapter 
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
    context.on('get', pluginInterop(adapter.read));
    context.on('put', pluginInterop(adapter.write));
  });
}


/**
 * 
 * @param {*} adapter 
 */
function bootstrapExtension(adapter) {
  const Gun = require('gun/gun');

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
    context.on('get', pluginInterop(adapter.read));
    context.on('put', pluginInterop(adapter.write));
  });
}


const flint = {
  register: function(mod = null) {
    if (!mod) {
      throw "Flint.register requires an instance of either Flint.Adapter or Flint.Plugin";
    }

    if (mod instanceof Adapter) {
      bootstrapAdapter(mod)
    } else if (mod instanceof Plugin) {
      bootstrapExtension(mod);
    } else {
      throw "Attempting to register an unsupported Gun extension with Flint. Flint.register requires an instance of either Flint.Adapter or Flint.Plugin";
    }
  },
  Adapter,
  Plugin,
  NOT_FOUND: 400,
};
flint.Flint = flint;

module.exports = flint;
