const memdown = require('memdown');
const levelup = require('levelup');

const mem = levelup('test', {
    db: memdown,
});

  module.exports = {mem};