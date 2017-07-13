# Gun-Flint: Easy Gun Adapters

Gun-Flint is a package that makes it easy to write adapters to connect your Gun database to various services (like databases, Pusher, etc.).

# Installation

`npm install gun-flint`

or 

`yarn add gun-flint`

# Usage

```javascript

const {Flint, Adapter} = require('gun-flint');

const myGunAdapter = new Adapter({
    opt: function(context, options) {
        if (options.myAwesomeAdapter) {

            // If necessary, connect to your service
            this.service = connect(options.myAwesomeAdapter);

            // Register Event Handlers if you'd like using `this.on`
            this.on('map', mapContext => {
                // handle some Gun event
            });
        }
    },
    get: function(key, done) {

        // handle request for data.
        this.service.getData(key, options).then((err, data) => {
            done(err, data);
        });
    },
    put: function(node, done) {

        // handle write
        // node is an object. You may need to JSON.stringify depending on the service you are connecting to.
        this.service.writeData(node, options).then((err, data) => {
            done(err);
        });
    }
});

Flint.register(myGunAdapter);

```

# Using Your Adapter

In the end, the good users of your adapter should install it like this:

```javascript

var Gun = require('gun');

// Adapter must come after Gun but before `new Gun`
require('your-awesome-adapter');

// Adapters all set up? Instantiate Gun.
var gun = new Gun({
    myAwesomeAdapter: {
        key: "This gets passed into the `opt` call when gun is initialized. Useful for allowing those who use your adapter to pass in DB drivers of the like."
    }
});

```

# Troubleshooting

If your adapter's `opt` function is never called, or when it is called, it doesn't have options that you passed to the constructor, here are some steps:

1.) Do NOT list Gun in your list of dependencies. You can list it in `peerDependencies` or `devDependencies`, especially the later if you need it for testing your adapter.
2.) Make sure Gun is not installed globally (run `npm list -g --depth=0` to check), and `npm uninstall -g gun` if it is.
3.) Delete your `node_modules` and install a fresh set.