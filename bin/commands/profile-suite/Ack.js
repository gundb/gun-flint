module.exports = class Ack {

    constructor(desc, done) {
        this.desc = desc;
        this.count = 0;
        this.errCount = 0;
        this.start = Date.now();
        return this;
    }

    ack(res) {
        if (res && res.err) {
            console.log({err: res.err});
            this.errCount++;
        } else {
            this.count++;
        }
    }

    done() {
        let ms = Date.now() - this.start;
        console.log(`${this.desc}: ${ms}ms; ${ms/1000}s; ${(ms/this.count).toFixed(3)} ms/node; errors: ${this.errCount}.`);
    }
}