const moment = require('moment');
const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ScheduledSessionDatetimeFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = {
      ScheduledSession: [
        'startDate',
        'endDate',
      ],
    };
    this.meta = {
      name: 'ScheduledSessionDatetimeFormatRule',
      description: 'Validates that a ScheduledSession has a startDate and endDate in the correct format.',
      tests: {
        startDate: {
          description: 'Raises a failure if a ScheduledSession startDate is in the incorrect format.',
          message: 'ScheduledSession startDate must be expressed as ISO 8601 format datetimes with a trailing definition of timezone. For example, `"2018-08-01T10:51:02Z"` or `"2018-08-01T10:51:02+01:00"`.\n\nFor more information, see [the specification](https://www.w3.org/2017/08/realtime-paged-data-exchange/#date-and-time-formats).',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
        endDate: {
          description: 'Raises a failure if a ScheduledSession endDate is in the incorrect format.',
          message: 'ScheduledSession endDate must be expressed as ISO 8601 format datetimes with a trailing definition of timezone. For example, `"2018-08-01T10:51:02Z"` or `"2018-08-01T10:51:02+01:00"`.\n\nFor more information, see [the specification](https://www.w3.org/2017/08/realtime-paged-data-exchange/#date-and-time-formats).',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  validateField(node, field) {
    const fieldObj = node.model.getField(field);
    if (typeof fieldObj === 'undefined') {
      return [];
    }
    const fieldValue = node.getValue(field);
    const errors = [];
    const DatetimeValue = moment(fieldValue, ['YYYY-MM-DD\\THH:mm:ssZZ'], true);

    if (!DatetimeValue.isValid()) {
      errors.push(
        this.createError(
          fieldObj.fieldName,
          {
            value: fieldValue,
            path: node.getPath(field),
          },
        ),
      );
    }
    return errors;
  }
};
