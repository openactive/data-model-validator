const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class BetaFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that no beta or extension fields are present in the data.';
  }

  validateField(node, field) {
    const errors = [];
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
    }
    return errors;
  }
};
