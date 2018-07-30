const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AgeRangeMinOrMaxRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Event: ['ageRange'] };
    this.description = 'Validates that an Event ageRange has a minValue or maxValue.';
  }

  validateField(node, field) {
    if (typeof (node.value[field]) === 'undefined') {
      return [];
    }
    const errors = [];

    if (typeof (node.value[field]) !== 'object'
      || (
        !PropertyHelper.objectHasField(node.value[field], 'minValue')
        && !PropertyHelper.objectHasField(node.value[field], 'maxValue')
      )
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.CONFORMANCE,
            message: 'Field must have a minValue or a maxValue defined',
            type: ValidationErrorType.MISSING_REQUIRED_FIELD,
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
