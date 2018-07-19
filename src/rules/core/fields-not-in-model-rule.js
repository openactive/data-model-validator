const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class FieldsNotInModelRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that all fields are present in the specification.';
  }

  validateField(data, field, model /* , parent */) {
    // Don't do this check for models that we don't actually have a spec for
    if (!model.hasSpecification) {
      return [];
    }
    const errors = [];
    if (model.inSpec.indexOf(field) < 0) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.CONFORMANCE,
            type: ValidationErrorType.FIELD_NOT_IN_SPEC,
            value: data[field],
            severity: ValidationErrorSeverity.WARNING,
            path: field,
          },
        ),
      );
    }
    return errors;
  }
};
