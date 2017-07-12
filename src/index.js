import Adapter from './Adapter';
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


module.exports = {
  adapter: function(adapt) {
    if (!adapt || !(typeof adapt.get === 'function' || typeof adapt.put === 'function')) {
      throw `An adapter must implement either a get or a put method, like so:
      flint.adapter({
          get: function() {},
          put: function() {}
      });`;
    }

    let newAdapter = new Adapter(adapt);
    bootstrapAdapter(newAdapter);
  },
  plugin: function(methods) {
    for (let methodName in methods) {
      var method = methods[methodName];
    }
  },
  NOT_FOUND: 400,
};
