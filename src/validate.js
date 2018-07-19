const modelLoader = require('openactive-data-models');
const Model = require('./classes/model');
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
      errors.push(
        new ValidationError({
          category: ValidationErrorCategory.INTERNAL,
          type: ValidationErrorType.MODEL_NOT_FOUND,
          value: `#${modelName}`,
          severity: ValidationErrorSeverity.WARNING,
          path,
        }),
      );
      modelObject = new Model();
    }
    return {
      errors,
      modelObject,
    };
  }

  static addFullPathToErrors(newErrors, existingErrors, path) {
    for (const error of newErrors) {
      error.path = path + (error.path ? `.${error.path}` : '');
    }
    return existingErrors.concat(newErrors);
  }

  static applySubModelRules(rules, data, field, model, parent, path) {
    let errors = [];
    let fieldsToTest = [];
    let isSingleObject = false;

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
        let currentFieldPath = `${path}.${field}`;
        if (!isSingleObject) {
          currentFieldPath += `[${index}]`;
        }

        const modelResponse = this.loadModel(
          subModelType,
          currentFieldPath,
        );
        errors = errors.concat(modelResponse.errors);

        const subModelErrors = this.applyModelRules(
          rules,
          fieldValue,
          modelResponse.modelObject,
          data,
          currentFieldPath,
        );
        errors = errors.concat(subModelErrors);
      }
      index += 1;
    }
    return errors;
  }

  static applyModelRules(rules, data, model, parent, path) {
    let errors = [];
    for (const rule of rules) {
      // Apply whole-model rule, and field-specific rules
      errors = this.addFullPathToErrors(rule.validate(data, model, parent), errors, path);
    }
    for (const field in data) {
      if (Object.prototype.hasOwnProperty.call(data, field)) {
        // If this field is itself a model, apply that model's rules to it
        errors = errors.concat(this.applySubModelRules(rules, data, field, model, parent, path));
      }
    }
    return errors;
  }
}

function validate(value, model) {
  let errors = [];

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
    if (typeof model === 'undefined' || model === null) {
      if (typeof value.type !== 'undefined') {
        modelName = value.type;
      }
    } else {
      modelName = model;
    }

    // Load the model
    const modelResponse = ApplyRules.loadModel(
      modelName,
      path,
    );
    errors = errors.concat(modelResponse.errors);

    // Apply the rules
    errors = errors.concat(
      ApplyRules.applyModelRules(
        ruleObjects,
        valueToTest,
        modelResponse.modelObject,
        null,
        path,
      ),
    );
    index += 1;
  }

  return errors.map(x => x.data);
}

module.exports = validate;
