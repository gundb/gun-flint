import Gun from 'gun/gun';

function isNil(val) {
    return val === null || val === undefined;
  }

export default {
    noop: () => {},
    isNil,
    union: (vertex, node, opt) => {
        if(!node || !node._){ return }
        vertex = vertex || Gun.state.to(node);
        if(!vertex || !vertex._){ return }
        opt = Gun.num.is(opt)? {machine: opt} : {machine: Gun.state()};
        opt.union = Gun.obj.copy(vertex); // Slow performance.
        if(!Gun.node.is(node, function(val, key){
            var HAM = Gun.HAM(opt.machine, Gun.state.is(node, key), Gun.state.is(vertex, key, true), val, vertex[key]);
            if(!HAM.incoming){ return }
            Gun.state.to(node, key, opt.union);
        })){ return }
        return opt.union;
    },
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
