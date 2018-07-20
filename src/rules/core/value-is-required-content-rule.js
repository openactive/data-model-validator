const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValueIsRequiredContentRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that fields match defined required content.';
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    if (typeof node.value[field] !== 'undefined'
      && typeof node.model.fields[field] !== 'undefined'
      && typeof node.model.fields[field].requiredContent !== 'undefined'
      && node.model.fields[field].requiredContent !== node.value[field]
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.CONFORMANCE,
            message: `Value for this field must be '${node.model.fields[field].requiredContent}'`,
            type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
            value: node.value[field],
            severity: ValidationErrorSeverity.FAILURE,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
    }
    return errors;
  }
};
