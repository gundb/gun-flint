# Gun-Flint: Easy Gun Adapters

Gun-Flint is a package that makes it easy to write adapters to connect your Gun database to various services (like databases, Pusher, etc.). Gun-Flint is not itself an adapter.

# Installation

`npm install gun-flint`

or 

`yarn add gun-flint`

# A Key Decision: Node, Key:Value, Delta

Since Gun is a graph database, its data structure requires some special consideration. Gun-Flint attempts to provide as much flexibility for the adapter developer to store data in a format that makes sense for the storage system you are using.

Building your Gun-Flint gives you an advantage of allowing Flint to ensure that the data coming from Gun reaches your adapter in a consistent format and returns data to Gun in a format that it recognizes.

### Node Storage

`get` request expect to read an entire Gun node; `put` requests write an entire node.

Pros: 
* Easiest to implement
* Flint handles merging of existing nodes with a delta on write so little chance of data corruption during conflict resolution.

Cons:
* Slower performance (requires a read > merge for every write); this is especially problematic if your data requires large nodes (e.g., a `users` node with millions of `user`s)

**When to Use:** Most/all nodes are small; optimal for document-based databases (e.g., MongoDB; Postgres)

### Key:Value

`get` request returns an array/list of nodes properties; `put` requests write batch updates to specific node's key:value pairs.

Pros: 
* Easy to implement
* Faster than full-node storage
* Doesn't require any additional concerns for conflict resolution

Cons:
* Every key:value pair (node property) would presumably require a separate record in storage (although not necessarily)
* Read requests require retrieval of multiple records

**When to Use:** Nodes are small/medium in size; optimal for SQL databases (MySQL, MSSql)

### Delta Storage

`get` request return an entire node, formatted in a way Gun recognizes; `put` requests receive a delta (diff) of node properties as well as conflict-resolution state indicators.

Pros:
* Most flexibility for how you store a delta
* High performance possibility, depending on how you implement storage.

Cons:
* Most difficult to implement, and incorrect implementation can lead to data corruption during conflict resolution.

**When to Use:** You need total control of storage format and one of the above formats is not sufficient.

# Usage

Whichever storage method you decide, your adapter needs to only implement three methods: opt, get, put. See the documentation for each storage method as the exact API depends on the method selected.

Stripped down, the API looks like this:
```javascript

const {Flint, NodeAdapter} = require('gun-flint');

const myGunAdapter = new NodeAdapter({
    opt: function(context, options) {
        // etc
    },
    get: function(key, done) {
        // handle read
    },
    put: function(node, done) {
        // handle write
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