module.exports = class KeyRing {
    constructor(base) {
        this.base = base;
        return this;
    }
    make(suffix) {
        return `${this.base}_${suffix}`;
    }
}