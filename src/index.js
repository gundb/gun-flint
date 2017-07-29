// Base
import BaseExtension from './base-extension';

// Adapters
import DeltaAdapter from './Adapter/delta-adapter';
import KeyValAdapter from './Adapter/key-val-adapter';
import NodeAdapter from './Adapter/node-adapter';

// Plugins
import Plugin from './Plugin/base-plugin';

// Middleware
import Middleware from './Middleware/base-middleware';

// Bundles Mixins
import BaseMixin from './Mixin/base-mixin';
import ProfilerMixin from './Mixin/ProfilerMixin';
import ResultStreamMixin from './Mixin/ResultStreamMixin';

// Utils
import Util from './util';

// Flint
const flint = {
  register: function(extension = null) {
    if (!extension || !(extension instanceof BaseExtension)) {
      throw "Flint.register requires an instance that extends BaseExtension.";
    }
    extension.bootstrap();
  },
  DeltaAdapter,
  NodeAdapter,
  KeyValAdapter,
  Plugin,
  Middleware,
  BaseMixin,
  Mixins: {
    BaseMixin,
    ResultStreamMixin,
    ProfilerMixin
  },
  Util
};

// Add circular reference for easier importing
flint.Flint = flint;

module.exports = flint;
