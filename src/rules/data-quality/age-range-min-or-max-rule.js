const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AgeRangeMinOrMaxRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Event: ['ageRange'] };
    this.meta = {
      name: 'AgeRangeMinOrMaxRule',
      description: 'Validates that an Event ageRange has a minValue or maxValue.',
      tests: {
        default: {
          message: '{{model}} "{{field}}" must have a minValue or a maxValue defined.',
          sampleValues: {
            field: 'ageRange',
            model: 'Event',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
      },
    };
  }

  validateField(node, field) {
    const fieldValue = node.getValue(field);
    if (typeof fieldValue === 'undefined') {
      return [];
    }
    const errors = [];

    if (typeof fieldValue !== 'object'
      || (
        !PropertyHelper.objectHasField(fieldValue, 'minValue')
        && !PropertyHelper.objectHasField(fieldValue, 'maxValue')
      )
    ) {
      errors.push(
        this.createError(
          'default',
          {
            value: fieldValue,
            path: node.getPath(field),
          },
          {
            field,
            model: node.model.type,
          },
        ),
      );
    }

    return errors;
  }
};
