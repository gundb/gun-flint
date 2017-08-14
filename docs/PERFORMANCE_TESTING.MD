# Integration Testing

Flint is packaged with a CLI tool that will run a series of performance tests against your adapter.

## Preparing for Testing

See [integration testing documentation](https://github.com/sjones6/gun-flint/blob/master/docs/INTEGRATION_TESTING.MD) for how to structure your adapter code for testability.

## Running the Suite

Commands should be run from the root of your adapter (wherever your `package.json` file lives).

Basic (no options): `flint profile ./relative/path/to/adapter`

With Options: `flint profile ./relative/path/to/adapter --opt='./flint-opt'`;

## WARNING! THIS WRITES DATA

These tests will write 10k nodes, with 10 properties in each node. Ensure that your test is directed at a non-production database or storage system that can easily be wiped and re-set.