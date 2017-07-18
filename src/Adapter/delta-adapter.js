import BaseAdapter from './base-adapter';

export default class DeltaAdapter extends BaseAdapter {

    /**
     *  @param {Object}   delta    - A Gun node
     *  @param {Function} callback - Call once read finished
     */
    read(result, done) {
        done(null, result);
    }

    /**
     *  @param {Object}   delta    - A delta for the current node
     *  @param {Function} callback - Called once write finished
     */
    write(delta, done) {
        this._put(delta, done);
    }
}
