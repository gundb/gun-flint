# Gun-Flint: Easy Gun Adapters

Gun-Flint is a package that makes it easy to write adapters to connect your Gun database to various services (like databases, Pusher, etc.).

# Installation

`npm install gun-flint`

or 

`yarn add gun-flint`

# Usage

```javascript

const Flint = require('gun-flint');

Flint.adapter(new Flint.Adapter({
    opt: function(context) {
         if (context.opt.myOption) {
             // do something
         }
    },
    get: function(key, options, cb) {

        // handle request for data
        getData(key, options).then((err, data) => {
            cb(err, data);
        });
    },
    put: function(node, cb) {

        // handle write required
        writeData(node, options).then((err, data) => {
            cb(err);
        });
    }
}));

```

# Using Your Adapter

In the end, your installation should look like this:

```javascript

var Gun = require('gun');

// Adapter must come after Gun.
require('your-adapter');

var gun = new Gun({
    adapterOpt: {
        key: "This gets passed into the `opt` call when gun is initialized. Useful for allowing those who use your adapter to pass in DB drivers of the like."
    }
});

```