import BaseMixin from './base-mixin';
import EventEmitter from 'events';

const EVENTS = {
    RESULT: 0,
    DONE: 1,
    ERR: 2
}

class ResultStream extends EventEmitter {
    constructor(done) {
        super();
        this.done = done;

        this.EVENTS = EVENTS;

        this
            .on(EVENTS.RESULT, this.in.bind(this))
            .on(EVENTS.DONE, this.done.bind(this))
            .on(EVENTS.ERROR, this.err.bind(this));
    }
    in(result) {
        this.done(null, result);
    }
    done(err, results) {
        this.done(err, results);
    }
    err(err) {
        this.done(err);
    }
}

export default class ResultStreamMixin extends BaseMixin {

    constructor(context) {
        super(context, [
            '_get'
        ]);
    }

    /**
     * @param {string}   key - A gun request context.
     * @param {function} done - Call when results received
     * @param {function} next - Next method in Adapter/Mixin chain
     * @returns {void}
     */
    _get(key, done, next) {
        const stream = new ResultStream(done);
        next(key, stream)
    }

}