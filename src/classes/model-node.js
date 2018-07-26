const OptionsHelper = require('../helpers/options');

const ModelNode = class {
  constructor(name, value, parentNode, model, options) {
    this.name = name;
    this.value = value;
    this.parentNode = parentNode;
    this.model = model;
    this.options = options || new OptionsHelper();
    this.rootNode = parentNode ? (parentNode.rootNode || parentNode) : null;
  }

  get cleanName() {
    return this.name.replace(/(\[[0-9]+\])+$/, '');
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

  static checkInheritRule(rule, field) {
    if (rule === '*') {
      return true;
    }
    if (
      typeof rule !== 'object'
      || rule === null
      || (
        typeof rule.exclude === 'undefined'
        && typeof rule.include === 'undefined'
      )
    ) {
      return false;
    }

    if (typeof rule.exclude !== 'undefined'
      && rule.exclude.indexOf(field) >= 0
    ) {
      return false;
    }

    if (typeof rule.include !== 'undefined'
      && rule.include.indexOf(field) < 0
    ) {
      return false;
    }
    return true;
  }

  getValueWithInheritance(field) {
    let testNode = this;
    let loopBusterIndex = 0;
    do {
      if (typeof (testNode.value[field]) !== 'undefined'
          && testNode.value[field] !== null
      ) {
        return testNode.value[field];
      }
      // Can we inherit this value?
      testNode = testNode.getInheritNode(field);
      loopBusterIndex += 1;
    } while (testNode !== null && loopBusterIndex < 50);
    return undefined;
  }

  getInheritNode(field) {
    // Check for a parentNode first that is the same type as us
    if (
      this.model.inSpec.indexOf(field) >= 0
      && this.parentNode !== null
      && this.parentNode.model.type === this.model.type
    ) {
      // Does our property allow us to inherit?
      if (
        typeof this.parentNode.model.fields[this.cleanName] !== 'undefined'
        && typeof this.parentNode.model.fields[this.cleanName].inheritsTo !== 'undefined'
      ) {
        if (
          this.constructor.checkInheritRule(
            this.parentNode.model.fields[this.cleanName].inheritsTo,
            field,
          )
        ) {
          return this.parentNode;
        }
      }
    } else if (typeof this.model.fields === 'object') {
      for (const fieldKey in this.model.fields) {
        if (Object.prototype.hasOwnProperty.call(this.model.fields, fieldKey)) {
          const modelField = this.model.fields[fieldKey];
          if (typeof modelField.inheritsFrom !== 'undefined'
            && this.constructor.checkInheritRule(modelField.inheritsFrom, field)
            && typeof this.value[modelField.fieldName] === 'object'
            && !(this.value[modelField.fieldName] instanceof Array)
            && this.value[modelField.fieldName] !== null
            && this.value[modelField.fieldName].type === this.model.type
          ) {
            return new this.constructor(
              modelField.fieldName,
              this.value[modelField.fieldName],
              this,
              this.model,
            );
          }
        }
      }
    }
    return null;
  }
};

module.exports = ModelNode;
