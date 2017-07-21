export default class BaseMixin {

    constructor(context, keys = []) {
        var _this = this;

        keys.forEach(propName => {
            const orig = context[propName];
            if (orig && typeof orig === 'function') {
                let wrap = function() {
                    let args = Array.prototype.slice.call(arguments, 0);
                    args.push(orig.bind(context));
                    _this[propName].apply(context, args);
                }
                context[propName] = wrap;
            } else {
                context[propName] = this[propName];
            }
        });
    }
}