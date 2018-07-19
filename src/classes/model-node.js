const ModelNode = class {
  constructor(name, value, parentNode, model) {
    this.name = name;
    this.value = value;
    this.parentNode = parentNode;
    this.model = model;
    this.rootNode = parentNode ? (parentNode.rootNode || parentNode) : null;
  }

  getPath() {
    const path = [];
    let node = this;
    do {
      path.unshift(node.name);
      node = node.parentNode;
    } while (node !== null);
    return path.join('.');
  }
};

module.exports = ModelNode;
