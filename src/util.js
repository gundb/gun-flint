function isNil(val) {
  return val === null || val === undefined;
}

export default {
    noop: () => {},
    isNil,
    gunify: (key, vals = []) => {
      let node = {
        '_': {
          '#': key,
          '>': {
          }
        }
      };

      function applyResult(val) {
          // metadata
          node._['>'][val.field] = val.state;

          // relation
          if (Object.keys(val).indexOf('rel') !== -1) {
            node[val.field] = {
              '#': val.rel
            }
          } else {

            // value
            node[val.field] = Object.keys(val).indexOf('val')? val.val : null;
          }
      }

      // Vals is an array. Add each to the node
      if (vals instanceof Array && vals.length) {
          vals.forEach(applyResult);
      } else {

        // Vals is an object. Just write that one.
        applyResult(vals);
      }

      // finish
      return node;
    }
};
