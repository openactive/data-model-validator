const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class TimezoneInPartialSchedule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['PartialSchedule'];
    this.meta = {
      name: 'TimezoneInPartialSchedule',
      description: 'Validates that scheduleTimezone is present when startTime or endTime are present.',
      tests: {
        default: {
          message: 'scheduleTimezone must be present when startTime or endTime are present',
          sampleValues: {
            field: 'scheduleTimezone',
            allowedValues: 'Europe/London',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
      },
    };
  }

  validateModel(node) {
    const startTime = node.getValue('startTime');
    const endTime = node.getValue('endTime');
    const scheduleTimezone = node.getValue('scheduleTimezone');

    if (typeof startTime === 'undefined'
        && typeof endTime === 'undefined'
    ) {
      return [];
    }
    const errors = [];

    if (typeof scheduleTimezone === 'undefined') {
      errors.push(
        this.createError(
          'default',
          {
            scheduleTimezone,
            path: node.getPath('scheduleTimezone'),
          },
        ),
      );
    }

    return errors;
  }
};
