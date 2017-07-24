import BaseExtension from './../base-extension';
import Util from './../util';

import Gun from 'gun/gun';

export default class BaseMiddleware extends BaseExtension {

    constructor(middleware) {
        super();

        this.outerContext = {};

        this._opt = middleware.opt ? middleware.opt.bind(this.outerContext) : this.noop;
        this._beforeGet = middleware.beforeGet ? middleware.beforeGet.bind(this.outerContext) : this.noop;
        this._beforePut = middleware.beforePut ? middleware.beforePut.bind(this.outerContext) : this.noop;

        for (let methodName in middleware) {
            if ({}.hasOwnProperty.call(middleware, methodName)
                && ['opt', 'beforeGet', 'beforePut'].indexOf(methodName === -1)
                ) {
                if (typeof middleware[methodName] === 'function') {
                    this.outerContext[methodName] = middleware[methodName].bind(this.outerContext);
                } else {
                    this.outerContext[methodName] = middleware[methodName];
                }
            }
        }

        this._read = this._read.bind(this);
        this._write = this._write.bind(this);

        return this;
    }

    bootstrap() {
        const _this = this;
        Gun.on('opt', function(context) {
            this.to.next(context);
            _this._opt.call(this.outerContext, context, context.opt, !context.once);

            if (context.once) {
                return;
            }

            // Allows other plugins to respond after middleware does it's work
            const pluginInterop = middleware => function (context) {

                const done = postContext => {
                    this.to.next(postContext);
                };
                
                return middleware(context, done);
            };

            // Register the driver.
            context.on('get', pluginInterop(_this._read));
            context.on('put', pluginInterop(_this._write));
        });
    }

    noop() {
        this.to.next(...arguments);
    }

    _read(context, done) {
        this._beforeGet(context, postContext => {
            done(postContext || context);
        });
    }

    _write(context, done) {
        this._beforePut(context, postContext => {
            done(postContext || context);
        });
    }
}