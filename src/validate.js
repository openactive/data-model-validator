const modelLoader = require('openactive-data-models');
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
    let modelObject;
    const errors = [];
    try {
      const modelData = modelLoader.loadModel(modelName);

      if (modelData) {
        modelObject = new Model(modelData, true);
      }
    } catch (e) {
      modelObject = null;
    }
    if (!modelObject) {
      const prop = PropertyHelper.getFullyQualifiedProperty(modelName);
      if (
        (typeof prop.namespace === 'undefined' || prop.namespace === null)
        && (typeof prop.prefix === 'undefined' || prop.prefix === null)
      ) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
              value: `#${modelName}`,
              severity: ValidationErrorSeverity.SUGGESTION,
              path,
            },
          ),
        );
      } else {
        errors.push(
          new ValidationError({
            category: ValidationErrorCategory.INTERNAL,
            type: ValidationErrorType.MODEL_NOT_FOUND,
            value: `#${modelName}`,
            severity: ValidationErrorSeverity.WARNING,
            path,
          }),
        );
      }
      modelObject = new Model();
    }
    return {
      errors,
      modelObject,
    };
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
      if (typeof fieldValue === 'object') {
        const subModelType = fieldValue.type;
        let currentFieldName = `${field}`;
        if (!isSingleObject) {
          currentFieldName += `[${index}]`;
        }

        let modelResponse = this.loadModel(
          subModelType,
          `${nodeToTest.getPath()}.${currentFieldName}`,
        );

        if (modelResponse.errors.length) {
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
              const altModelResponse = this.loadModel(
                altSubModelType,
                `${nodeToTest.getPath()}.${currentFieldName}`,
              );
              // Preserve the original error if we had an experimental error
              if (
                altModelResponse.errors.length === 0
                && modelResponse.errors[0].type === ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED
              ) {
                altModelResponse.errors.push(modelResponse.errors[0]);
              }
              modelResponse = altModelResponse;
            }
          }
        }
        errors = errors.concat(modelResponse.errors);

        const newNodeToTest = new ModelNode(
          currentFieldName,
          fieldValue,
          nodeToTest,
          modelResponse.modelObject,
          nodeToTest.options,
        );

        const subModelErrors = this.applyModelRules(
          rules,
          newNodeToTest,
        );
        errors = errors.concat(subModelErrors);
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

  // Load the rules
  const ruleObjects = [];
  for (let index = 0; index < Rules.length; index += 1) {
    ruleObjects.push(new Rules[index]());
  }

  let isSingleObject = false;
  let valuesToTest = [];

  if (value instanceof Array) {
    valuesToTest = value;
    // This should throw a warning - we're only expecting
    // to validate single objects with this library
    errors.push(
      new ValidationError({
        category: ValidationErrorCategory.INTERNAL,
        message: 'Arrays are not supported for validation. Please only submit single objects for validation.',
        type: ValidationErrorType.INVALID_JSON,
        value,
        severity: ValidationErrorSeverity.WARNING,
        path: '$',
      }),
    );
  } else if (typeof value === 'object') {
    valuesToTest.push(value);
    isSingleObject = true;
  } else {
    // This should throw a failure - we can only evaluate objects
    errors.push(
      new ValidationError({
        category: ValidationErrorCategory.INTERNAL,
        message: 'Only objects are supported for validation. Please only submit single objects for validation.',
        type: ValidationErrorType.INVALID_JSON,
        value,
        severity: ValidationErrorSeverity.FAILURE,
        path: '$',
      }),
    );
  }

  let index = 0;
  for (const valueToTest of valuesToTest) {
    let path = '$';
    if (!isSingleObject) {
      path += `[${index}]`;
    }

    let modelName;

    // If no model provided, use the type in the object
    if (typeof options.type === 'undefined' || options.type === null) {
      const modelType = PropertyHelper.getObjectField(value, '@type');
      if (typeof modelType !== 'undefined') {
        modelName = modelType;
      }
    } else {
      modelName = options.type;
    }

    let modelResponse;

    // Do we have a type? No? We should throw an error for data quality
    if (typeof modelName === 'undefined') {
      errors.push(
        new ValidationError({
          category: ValidationErrorCategory.DATA_QUALITY,
          message: 'Please add a "type" property to this JSON object.',
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
          value,
          severity: ValidationErrorSeverity.WARNING,
          path,
        }),
      );
    } else {
      // Load the model
      modelResponse = ApplyRules.loadModel(
        modelName,
        path,
      );
      errors = errors.concat(modelResponse.errors);
    }

    const nodeToTest = new ModelNode(
      path,
      valueToTest,
      null,
      typeof modelResponse === 'undefined' ? null : modelResponse.modelObject,
      optionsObj,
    );

    // Apply the rules
    errors = errors.concat(
      ApplyRules.applyModelRules(
        ruleObjects,
        nodeToTest,
      ),
    );
    index += 1;
  }

  return errors.map(x => x.data);
}

module.exports = validate;
