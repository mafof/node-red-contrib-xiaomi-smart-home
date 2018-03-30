
class RegisterNode {
  constructor(node, socket) {
    addNode(node.id);
  }

  addNode(id, socket) {
    if(global.listNodeXiaomiGateway == null || global.listNodeXiaomiGateway == undefined) global.listNodeXiaomiGateway = {};
  }
}

module.exports = RegisterNode;
