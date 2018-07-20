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
    if (typeof node.value[field] !== 'undefined'
      && typeof node.model.fields[field] !== 'undefined'
      && typeof node.model.fields[field].options !== 'undefined'
      && node.model.fields[field].options.indexOf(node.value[field]) < 0
    ) {
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
    return errors;
  }
};
