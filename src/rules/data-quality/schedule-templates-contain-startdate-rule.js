const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ScheduleTemplatesContainStartDate extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Schedule: ['urlTemplate', 'idTemplate'] };
    this.meta = {
      name: 'ScheduleTemplatesContainStartDate',
      description: 'Validates that the urlTemplate or idTemplate fields in a Schedule model contain the {startDate} placeholder.',
      tests: {
        default: {
          description: 'Validates that the urlTemplate or idTemplate fields in a Schedule model contain the {startDate} placeholder.',
          message: 'The urlTemplate or idTemplate field in a Schedule model must contain the {startDate} placeholder, e.g. `https://api.example.org/session-series/123/{startDate}`',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.URI_TEMPLATE_MISSING_PLACEHOLDER,
        },
      },
    };
  }

  validateField(node, field) {
    const fieldValue = node.getValue(field);

    if (typeof fieldValue !== 'string') {
      return [];
    }

    const errors = [];

    if (!fieldValue.includes('{startDate}')) {
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
