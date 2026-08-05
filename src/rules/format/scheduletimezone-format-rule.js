const momentTZ = require('moment-timezone');
const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ScheduleTimezoneMatchesIANAList extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Schedule', 'PartialSchedule'];
    this.meta = {
      name: 'ScheduleTimezoneMatchesIANAList',
      description: 'Validates that scheduleTimezone matches an IANA Timezone.',
      tests: {
        default: {
          message: 'scheduleTimezone must be one of the timezones contained in the [IANA Timezone database](https://www.iana.org/time-zones)',
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
    const timezoneList = momentTZ.tz.names();
    const scheduleTimezone = node.getValue('scheduleTimezone');

    if (typeof scheduleTimezone === 'undefined') {
      return [];
    }
    const errors = [];

    if (!timezoneList.includes(scheduleTimezone)) {
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
