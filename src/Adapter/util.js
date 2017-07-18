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
      '#': key,
      '_': {
        '>': {
          '#': key
        }
      }
    };
    vals.forEach(val => {
      node._['>'][val.nodeKey] = val.state;
      if (val.rel) {
        node[val.nodeKey] = {
          '#': val.rel
        }
      } else {
        node[val.nodeKey] = !isNil(val.val) ? val.val : ""
      }
    });
    return node;
  }
};
