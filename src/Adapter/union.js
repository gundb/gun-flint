/**
 * 
 * @param {object} vertex    A vertex to merge with the node
 * @param {object} node      A node to merge with the vertex
 * @param {number} opt       State for the union
 */
module.exports = (Gun, vertex, node, opt) => {
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
}