const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValueInOptionsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that fields contain allowed values.';
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    const fieldObj = node.model.getField(field);

    if (typeof node.value[field] !== 'undefined'
      && typeof fieldObj !== 'undefined'
      && typeof fieldObj.options !== 'undefined'
    ) {
      let isInOptions = true;
      if (node.value[field] instanceof Array && fieldObj.canBeArray()) {
        for (const value of node.value[field]) {
          if (fieldObj.options.indexOf(value) < 0) {
            isInOptions = false;
            break;
          }
        }
      } else if (fieldObj.options.indexOf(node.value[field]) < 0) {
        isInOptions = false;
      }

      if (!isInOptions) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
              value: node.value[field],
              severity: ValidationErrorSeverity.FAILURE,
              path: `${node.getPath()}.${field}`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
