const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ScheduleTemplatesValid extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Schedule: ['urlTemplate', 'idTemplate'] };
    this.meta = {
      name: 'ScheduleTemplatesValid',
      description: 'Validates that Schedule urlTemplate and idTemplate fields are the correct format',
      tests: {
        default: {
          description: 'Validates that Schedule idTemplate or urlTemplate fields are in the correct format.',
          message: 'The field must contain a valid resource identifier. For example `{startDate}` in `https://api.example.org/session-series/123/{startDate}`',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  validateField(node, field) {
    const fieldObj = node.model.getField(field);
    const fieldValue = node.getValue(field);

    if (typeof fieldValue !== 'string') {
      return [];
    }

    const errors = [];

    if (typeof fieldObj.valueConstraint !== 'undefined'
      && (fieldObj.valueConstraint === 'UriTemplate'
      && !PropertyHelper.isUrlTemplate(fieldValue))) {
      errors.push(
        this.createError(
          'default',
          {
            fieldValue,
            path: node.getPath(field),
          },
        ),
      );
    }

    return errors;
  }
};
