const jp = require('jsonpath');
const Model = require('./model');
const DataModelHelper = require('../helpers/data-model');
const OptionsHelper = require('../helpers/options');
const PropertyHelper = require('../helpers/property');
const { InvalidModelNameError } = require('../exceptions');

const ModelNode = class {
  constructor(name, value, parentNode, model, options, arrayIndex) {
    this.name = name;
    this.arrayIndex = arrayIndex;
    this.value = value;
    this.parentNode = parentNode;
    this.model = model;
    this.options = options || new OptionsHelper();
    this.rootNode = parentNode ? (parentNode.rootNode || parentNode) : null;
  }

  get cleanName() {
    return this.name;
  }

  getPath(...fields) {
    const path = [];
    const tree = [];
    let node = this;
    do {
      if (typeof node.arrayIndex !== 'undefined') {
        path.unshift(node.arrayIndex);
        tree.unshift({
          arrayIndex: node.arrayIndex,
        });
      }
      path.unshift(node.name);
      tree.unshift({
        name: node.name,
        type: node.model.type,
      });
      node = node.parentNode;
    } while (node !== null);
    for (const field of fields) {
      if (typeof field !== 'undefined') {
        path.push(field);
        tree.push({
          name: field,
        });
      }
    }
    return {
      string: jp.stringify(path).replace(/([\][])\1+/g, '$1'),
      tree,
    };
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

  hasField(field) {
    return typeof this.value[field] !== 'undefined';
  }

  hasMappedField(field) {
    return PropertyHelper.objectHasField(this.value, field, this.options.version);
  }

  getMappedFieldName(field) {
    return PropertyHelper.objectMappedFieldName(this.value, field, this.options.version);
  }

  getValue(field) {
    if (typeof this.value[field] !== 'undefined') {
      return this.value[field];
    }
    return this.getMappedValue(field);
  }

  getMappedValue(field) {
    return PropertyHelper.getObjectField(this.value, field, this.options.version);
  }

  getValueWithInheritance(field) {
    let testNode = this;
    let loopBusterIndex = 0;
    const prop = PropertyHelper.getFullyQualifiedProperty(field, this.options.version);
    const mappedField = prop.alias || prop.label;
    do {
      const testValue = testNode.getMappedValue(mappedField);
      if (typeof testValue !== 'undefined'
          && testValue !== null
      ) {
        return testValue;
      }
      // Can we inherit this value?
      testNode = testNode.getInheritNode(mappedField);
      loopBusterIndex += 1;
    } while (testNode !== null && loopBusterIndex < 50);
    return undefined;
  }

  canInheritFrom(parentNode) {
    // Note the below is commented out temporarily to allow Course fields to be inherited by CourseInstance
    return true || (
      parentNode.model.type === this.model.type
      || this.model.subClassGraph.indexOf(`#${parentNode.model.type}`) >= 0
      || parentNode.model.subClassGraph.indexOf(`#${this.model.type}`) >= 0
      || this.model.subClassGraph.filter((value) => parentNode.model.subClassGraph.indexOf(value) !== -1).length > 0
    );
  }

  getInheritNode(field) {
    // Check for a parentNode first that is the same type as us
    if (
      this.model.inSpec.indexOf(field) >= 0
      && this.parentNode !== null
      && this.canInheritFrom(this.parentNode)
      // Does our property allow us to inherit?
      && typeof this.parentNode.model.fields[this.cleanName] !== 'undefined'
      && typeof this.parentNode.model.fields[this.cleanName].inheritsTo !== 'undefined'
      // @ts-expect-error
      && this.constructor.checkInheritRule(
        this.parentNode.model.fields[this.cleanName].inheritsTo,
        field,
      )
    ) {
      return this.parentNode;
    }

    if (typeof this.model.fields === 'object' && this.model.fields !== null) {
      for (const fieldKey in this.model.fields) {
        if (Object.prototype.hasOwnProperty.call(this.model.fields, fieldKey)) {
          const modelField = this.model.fields[fieldKey];
          const fieldValue = this.getValue(fieldKey);
          if (typeof modelField.inheritsFrom !== 'undefined'
            // @ts-expect-error
            && this.constructor.checkInheritRule(modelField.inheritsFrom, field)
            && typeof fieldValue === 'object'
            && !(fieldValue instanceof Array)
            && fieldValue !== null
          ) {
            // allow for data using @type instead of type
            // because it's standard JSON-LD even in OA world expected to use the type shortcut
            const fieldValueType = (fieldValue.type || fieldValue['@type']);
            let parentModel;
            try {
              parentModel = DataModelHelper.loadModel(fieldValueType, this.options.version);
            } catch (e) {
              if (e instanceof InvalidModelNameError) {
                // no parent model if name is invalid
                parentModel = null;
              } else {
                throw e;
              }
            }
            if (parentModel) {
              // @ts-expect-error
              const parentNode = new this.constructor(
                modelField.fieldName,
                fieldValue,
                this,
                new Model(parentModel),
                this.options,
              );
              if (this.canInheritFrom(parentNode)) {
                return parentNode;
              }
            }
          }
        }
      }
    }
    return null;
  }
};

/**
 * @typedef {ModelNode} ModelNodeType
 */

module.exports = ModelNode;
