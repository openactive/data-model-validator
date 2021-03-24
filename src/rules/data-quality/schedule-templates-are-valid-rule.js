const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ScheduleUrlTemplateValid extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Schedule: ['urlTemplate', 'idTemplate'] };
    this.meta = {
      name: 'ScheduleUrlTemplateValid',
      description: 'Validates that the urlTemplate is of the correct format',
      tests: {
        default: {
          description: 'Validates that the @context url matches the correct scheme and subdomain (https://openactive.io).',
          message: 'When referencing the OpenActive domain, you must start your URLs with https://openactive.io.',
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
