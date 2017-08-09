module.exports = class Command {

    constructor (args) {
        this.args = args;
    }

    static describe() {
    }

    static help() {

    }

    flintPath() {
        return __filename.replace(/gun\-flint\/.*$/, 'gun-flint');
    }

    run(args) {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
}