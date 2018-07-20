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

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    if (node.model.inSpec.indexOf(field) < 0) {
      if (field.toLowerCase().substring(0, 5) === 'beta:'
        || field.toLowerCase().substring(0, 4) === 'ext:'
      ) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
              value: node.value[field],
              severity: ValidationErrorSeverity.WARNING,
              path: `${node.getPath()}.${field}`,
            },
          ),
        );
      } else {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.FIELD_NOT_IN_SPEC,
              value: node.value[field],
              severity: ValidationErrorSeverity.WARNING,
              path: `${node.getPath()}.${field}`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
