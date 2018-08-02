const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoEmptyValuesRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'NoEmptyValuesRule',
      description: 'Validates that fields are not null, an empty string or an empty array.',
      tests: {
        notNull: {
          description: 'Validates that a field is not null.',
          message: 'Fields must not be null',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_IS_EMPTY,
        },
        notEmptyString: {
          description: 'Validates that a field is not an empty string.',
          message: 'Fields must not contain empty strings.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_IS_EMPTY,
        },
        notEmptyArray: {
          description: 'Validates that a field is not an empty array.',
          message: 'Fields must not contain empty arrays.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_IS_EMPTY,
        },
      },
    };
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    if (typeof node.value[field] !== 'undefined') {
      let testKey;
      if (node.value[field] === null) {
        testKey = 'notNull';
      } else if (node.value[field] instanceof Array && node.value[field].length === 0) {
        testKey = 'notEmptyArray';
      } else if (node.value[field] === '') {
        testKey = 'notEmptyString';
      }
      if (testKey) {
        errors.push(
          this.createError(
            testKey,
            {
              value: node.value[field],
              path: node.getPath(field),
            },
          ),
        );
      }
    }
    return errors;
  }
};
