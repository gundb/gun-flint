require('babel-register');
const Command = require('./../base/Command');
const path = require('path');
const profileSuite = require('./profile-suite/index');

module.exports = class ProfileAdapter extends Command {
    constructor(args) {
        super(args);
    }

    static describe() {
        return "Run a performance testing suite against an adapter.";
    }

    static help() {
        return `
${TestAdapter.describe()}
Commant: flint profile relative/path/to/adapter

Options:
    --opt="relative/path/to/options.js"  optional, but required if adapter requires options to instantiate
    --skip-packaged-gun                  Don't use the Gun version packaged with flint; gun is available as a npm module (e.g., require('gun/gun'))
`;
    }

    run() {
        return new Promise((resolve, reject) => {
            // Variables
            let Adapter;
            let opt;
            let done = err => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            }
            let profile = profileSuite.bind(this, done, this.args);

            // Ensure the path to the adapter is given
            let adapterPath = this.args._[3];
            if (!adapterPath) {
                reject(new Error(`A path to the adapter to test is required: 'flint test ./relative/path/to/adapter'.`));
            }

            // Ensure that the adapter is retrievable
            try {
                Adapter = require(path.join(process.cwd(), adapterPath));

                if (!Adapter) {
                    throw `Adapter not found at ${path.join(process.cwd(), adapterPath)}`
                }
            } catch (e) {
                reject(new Error(`Unable to find the adapter to test. Ensure that relative path the adapter is given: 'flint test ./relative/path/to/adapter'.`));
            }

            // Get the options, if given
            if (this.args.opt) {
                try {
                    opt = require(path.join(process.cwd(), this.args.opt));
                } catch (e) {
                    reject(new Error(`Unable to find the adapter OPTIONS in order to run profiling tests. Ensure that relative path the options are given: 'flint test ./relative/path/to/adapter --opt="./relative/path/to/opt.js'.`));
                }
            
                if (!opt) {
                    throw `Adapter OPTIONS not found at ${path.join(process.cwd(), this.args.opt)}`
                } else if (opt instanceof Promise) {
                    opt
                        .then(realOpt => profile(Adapter, opt))
                        .catch(err => reject(err))
                } else {
                    profile(Adapter, opt);
                }
            } else {
                profile(Adapter);
            }
        });
    }
}