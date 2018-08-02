const modelLoader = require('openactive-data-models');
const jp = require('jsonpath');
const Model = require('./classes/model');
const ModelNode = require('./classes/model-node');
const OptionsHelper = require('./helpers/options');
const PropertyHelper = require('./helpers/property');
const Rules = require('./rules');
const ValidationErrorSeverity = require('./errors/validation-error-severity');
const ValidationErrorCategory = require('./errors/validation-error-category');
const ValidationErrorType = require('./errors/validation-error-type');
const ValidationError = require('./errors/validation-error');

class ApplyRules {
  static loadModel(modelName, path) {
    // Load the model (if it exists)
    // If the model doesn't exist, we can still apply a barebones set of
    // rules on the object.
    let modelObject = null;
    if (typeof modelName !== 'undefined') {
      try {
        const modelData = modelLoader.loadModel(modelName);
        if (modelData) {
          modelObject = new Model(modelData, true);
        }
      } catch (e) {
        modelObject = new Model();
      }
    }
    if (!modelObject) {
      modelObject = new Model();
    }
    return modelObject;
  }

  static applySubModelRules(rules, nodeToTest, field) {
    // parent, path
    let errors = [];
    let fieldsToTest = [];
    let isSingleObject = false;
    const data = nodeToTest.value;

    if (data[field] instanceof Array) {
      fieldsToTest = data[field];
    } else if (typeof data[field] === 'object' && data[field] !== null) {
      fieldsToTest.push(data[field]);
      isSingleObject = true;
    }

    let index = 0;
    for (const fieldValue of fieldsToTest) {
      if (typeof fieldValue === 'object' && !(fieldValue instanceof Array)) {
        const subModelType = PropertyHelper.getObjectField(fieldValue, '@type');
        const currentFieldName = field;
        let currentFieldIndex;
        if (!isSingleObject) {
          currentFieldIndex = index;
        }

        // Check this is not a value object
        if (
          typeof subModelType !== 'undefined'
          || typeof fieldValue['@value'] === 'undefined'
        ) {
          let modelObj = this.loadModel(
            subModelType,
          );

          if (!modelObj.hasSpecification) {
            // Try loading from the parent model type if we can
            if (
              typeof nodeToTest.model.fields[field] !== 'undefined'
              && typeof nodeToTest.model.fields[field].model !== 'undefined'
            ) {
              const altSubModelType = nodeToTest.model.fields[field].model.replace(/^(ArrayOf)?#/, '');
              if (
                typeof nodeToTest.model.fields[field].requiredType === 'undefined'
                && typeof nodeToTest.model.fields[field].alternativeTypes === 'undefined'
                && typeof nodeToTest.model.fields[field].alternativeModels === 'undefined'
              ) {
                modelObj = this.loadModel(
                  altSubModelType,
                );
              }
            }
          }

          const newNodeToTest = new ModelNode(
            currentFieldName,
            fieldValue,
            nodeToTest,
            modelObj,
            nodeToTest.options,
            currentFieldIndex,
          );

          const subModelErrors = this.applyModelRules(
            rules,
            newNodeToTest,
          );
          errors = errors.concat(subModelErrors);
        }
      }
      index += 1;
    }
    return errors;
  }

  static applyModelRules(rules, nodeToTest) {
    let errors = [];
    for (const rule of rules) {
      // Apply whole-model rule, and field-specific rules
      errors = errors.concat(rule.validate(nodeToTest));
    }
    for (const field in nodeToTest.value) {
      if (Object.prototype.hasOwnProperty.call(nodeToTest.value, field)) {
        // If this field is itself a model, apply that model's rules to it
        errors = errors.concat(this.applySubModelRules(rules, nodeToTest, field));
      }
    }
    return errors;
  }
}

function validate(value, options) {
  let errors = [];

  // Setup the options
  const optionsObj = new OptionsHelper(options);

  // Load the raw data rules
  const rawRuleObjects = [];
  for (let index = 0; index < Rules.raw.length; index += 1) {
    rawRuleObjects.push(new Rules.raw[index]());
  }

  for (const rule of rawRuleObjects) {
    errors = errors.concat(rule.validate(value));
  }

  let isSingleObject = false;
  let valuesToTest = [];

  if (value instanceof Array) {
    valuesToTest = value;
  } else if (typeof value === 'object') {
    valuesToTest.push(value);
    isSingleObject = true;
  }

  // Load the core rules
  const coreRuleObjects = [];

  if (valuesToTest.length) {
    for (let index = 0; index < Rules.core.length; index += 1) {
      coreRuleObjects.push(new Rules.core[index]());
    }
  }

  let index = 0;
  for (const valueToTest of valuesToTest) {
    const path = '$';
    const pathArr = [path];
    let pathIndex;
    if (!isSingleObject) {
      pathIndex = index;
      pathArr.push(pathIndex);
    }

    const compiledPath = jp.stringify(pathArr);

    let modelName;

    // If no model provided, use the type in the object
    if (typeof optionsObj.type === 'undefined' || optionsObj.type === null) {
      const modelType = PropertyHelper.getObjectField(value, '@type');
      if (typeof modelType !== 'undefined') {
        modelName = modelType;
      }
    } else {
      modelName = optionsObj.type;
    }

    // Load the model
    const modelObj = ApplyRules.loadModel(
      modelName,
    );

    const nodeToTest = new ModelNode(
      path,
      valueToTest,
      null,
      modelObj,
      optionsObj,
      pathIndex,
    );

    // Apply the rules
    errors = errors.concat(
      ApplyRules.applyModelRules(
        coreRuleObjects,
        nodeToTest,
      ),
    );
    index += 1;
  }

  return errors.map(x => x.data);
}

module.exports = validate;
