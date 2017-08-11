# Integration Testing

Flint is packaged with a CLI tool that will run a series of integration tests against your adapter. Of course, you can write unit tests as well for your adapter, but these tests aim to verify that the adapter can handle all necessary operations to store and retrieve data.

If all the integration suite passes, your adapter should be good to go!

The suite uses `mocha` as a test-runner and `babel` to transpile your adapter on the fly if you want to write ES6+.

## Preparing for Testing

Since this is an _integration_ suite, the intention is that this would hit the database or external service. This can and should write records to the DB (for instance); via the options, you can make sure this runs against a testing environment so the testing does not mung up the existing storage.

If you use a Continuous Integration service like Travis-CI, running your integration suite against those can be quick and easy and avoid the environment issues entirely.

### 1. Testable Code Structure

Make sure your adapter can be exported separately and NOT registered with `flint.register`. This is crucial so that the test suite can wire it up correctly.

Your file structure should look like this:
```
- -index.js  <-- the main entry point for your package
- -adapter.js <-- the adapter file
```

```javascript
// index.js
const Flint = require('gun-flint');
const Adapter = require('./adapter.js');
Flint.register(Adapter);
```

```javascript
// adapter.js
const {Flint, KeyValAdapter} = require('gun-flint');
const Adapter = new KeyValAdapter({
    opt: ...,
    get: ...,
    put: ...
});
module.exports = Adapter;
```

### 2. Passing Options to Gun

In most cases, your adapter will require some sort of options to be passed to it when Gun is instantiated. Flint can grab these and pass them in to Gun while running the test suite (see the next section).

With the optiosn, your file structure should look something like this:
```
- -index.js  <-- see above
- -adapter.js
- -flint-opt.js
```

These options can be run synchronously or asynchronously via a promise.

```javascript
// synchronous
module.exports = {
    adapter: {
        pw: 'some string',
        user: 'some user'
    }
};
```

```javascript
// asynchronous
module.exports = new Promise((resolve, reject) => {
    // do some work, e.g., get a db connection
    resolve({
        adapter: {
            pw: 'some string',
            user: 'some user'
        }
    })
});
```

The one option that `flint` will enforce is `file: false`. This way Gun will not attempt to dump to a file and throw off the test results.

## Running the Suite

Commands should be run from the root of your adapter (wherever your `package.json` file lives).

Basic (no options): `flint test ./relative/path/to/adapter`

With Options: `flint test ./relative/path/to/adapter --opt='./flint-opt'`;

Due to some of the implementation details, the Gun instance that is used is packaged with Flint. If you packaged Gun with your adapter, you can pass an additional flag:

Don't use packaged Gun: `flint test ./adapter --opt='./flint-opt' --skip-packaged-gun`;

In this case, Gun would need to be available in your node_modules OR installed globally. But, **warning**, including Gun in your package dependencies can cause issues when it comes time to deploy. It's safer to **not** include it and use the version of Gun packaged with `flint`, but the option exists if you need it.

## CI with Travis-CI

Running the integration test

Here's how simple a `.travis.yml` file could be, supposing that the adapter is connecting to MongoDB:
```yaml
language: node_js
node_js:
- 8
- 7
- 6
service:
- mongodb
script:
- flint test ./adapter.js --opt='./flint-opt'
```