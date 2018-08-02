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
        this.createError(
          'default',
          {
            value: node.value[field],
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
