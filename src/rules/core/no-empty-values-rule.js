const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoEmptyValuesRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that fields are not null, an empty string or an empty array.';
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    if (typeof node.value[field] !== 'undefined') {
      let isError = false;
      let message = '';
      if (node.value[field] === null) {
        isError = true;
        message = 'Fields must not be null';
      } else if (node.value[field] instanceof Array && node.value[field].length === 0) {
        isError = true;
        message = 'Fields must not contain empty arrays';
      } else if (node.value[field] === '') {
        isError = true;
        message = 'Fields must not contain empty strings';
      }
      if (isError) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              message,
              type: ValidationErrorType.FIELD_IS_EMPTY,
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
