const DataModelHelper = require('./helpers/data-model');
const Model = require('./classes/model');
const ModelNode = require('./classes/model-node');
const RawHelper = require('./helpers/raw');
const OptionsHelper = require('./helpers/options');
const PropertyHelper = require('./helpers/property');
const Rules = require('./rules');

class ApplyRules {
  static loadModel(modelName, version) {
    // Load the model (if it exists)
    // If the model doesn't exist, we can still apply a barebones set of
    // rules on the object.
    let modelObject = null;
    if (typeof modelName !== 'undefined') {
      const qualifiedModelName = PropertyHelper.getFullyQualifiedProperty(modelName, version);
      try {
        const modelData = DataModelHelper.loadModel(qualifiedModelName.alias || modelName, version);
        if (modelData) {
          modelObject = new Model(modelData, version, true);
        }
      } catch (e) {
        modelObject = new Model({}, version);
      }
    }
    if (!modelObject) {
      modelObject = new Model({}, version);
    }
    return modelObject;
  }

  static async applySubModelRules(rules, nodeToTest, field) {
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
      if (typeof fieldValue === 'object' && fieldValue !== null && !(fieldValue instanceof Array)) {
        const subModelType = PropertyHelper.getObjectField(fieldValue, '@type', nodeToTest.options.version);
        const currentFieldName = field;
        let currentFieldIndex;
        if (!isSingleObject) {
          currentFieldIndex = index;
        }

        // Check this is not a value object
        if (
          typeof fieldValue['@value'] === 'undefined'
        ) {
          let modelObj = this.loadModel(
            subModelType,
            nodeToTest.options.version,
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
                  nodeToTest.options.version,
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

          const subModelErrors = await this.applyModelRules(
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

  static async applyModelRules(rules, nodeToTest) {
    let errors = [];
    for (const rule of rules) {
      const newErrors = await rule.validate(nodeToTest);
      // Apply whole-model rule, and field-specific rules
      errors = errors.concat(newErrors);
    }
    for (const field in nodeToTest.value) {
      if (Object.prototype.hasOwnProperty.call(nodeToTest.value, field)) {
        // If this field is itself a model, apply that model's rules to it
        const subModelErrors = await ApplyRules.applySubModelRules(rules, nodeToTest, field);
        errors = errors.concat(subModelErrors);
      }
    }
    return errors;
  }
}

async function validate(value, options) {
  let errors = [];
  let valueCopy = value;

  // Setup the options
  const optionsObj = new OptionsHelper(options);

  // Load the raw data rules
  const rawRuleObjects = [];
  for (let index = 0; index < Rules.raw.length; index += 1) {
    rawRuleObjects.push(new Rules.raw[index](optionsObj));
  }

  for (const rule of rawRuleObjects) {
    const response = await rule.validate(valueCopy);
    errors = errors.concat(response.errors);
    if (typeof response.data !== 'undefined') {
      valueCopy = response.data;
    }
  }

  let isSingleObject = false;
  let valuesToTest = [];

  if (valueCopy instanceof Array) {
    valuesToTest = valueCopy;
  } else if (typeof valueCopy === 'object' && valueCopy !== null) {
    valuesToTest.push(valueCopy);
    isSingleObject = true;
  }

  // Load the core rules
  const coreRuleObjects = [];

  if (valuesToTest.length) {
    for (let index = 0; index < Rules.core.length; index += 1) {
      coreRuleObjects.push(new Rules.core[index](optionsObj));
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

    let modelName;

    // If no model provided, use the type in the object
    if (typeof optionsObj.type === 'undefined' || optionsObj.type === null) {
      const modelType = PropertyHelper.getObjectField(valueToTest, '@type', optionsObj.version);
      if (typeof modelType !== 'undefined') {
        modelName = modelType;
      } else if (RawHelper.isRpdeFeed(value)) {
        modelName = 'FeedPage';
      }
    } else {
      modelName = optionsObj.type;
    }

    // Load the model
    const modelObj = ApplyRules.loadModel(
      modelName,
      optionsObj.version,
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
    const modelErrors = await ApplyRules.applyModelRules(
      coreRuleObjects,
      nodeToTest,
    );
    errors = errors.concat(modelErrors);
    index += 1;
  }

  return errors.map((x) => x.data);
}

function isRpdeFeed(data) {
  return RawHelper.isRpdeFeed(data);
}

module.exports = {
  validate,
  isRpdeFeed,
};
