const { RRule } = require('rrule');
const Rule = require('../rule');
const getFrequency = require('../../helpers/frequency-converter');
const getDateTime = require('../../helpers/datetime-helper');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValidRecurrenceRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Schedule'];
    this.meta = {
      name: 'ValidRecurrenceRule',
      description:
        'Validates that the Schedule contains the correct information to generate a valid iCal recurrence rule.',
      tests: {
        default: {
          message:
            'Schedule must contains the correct information to generate a valid iCal recurrence rule.',
          sampleValues: {
            startTime: '08:30',
            endTime: '09:30',
            startDate: '2021-03-19',
            repeatFrequency: 'P1W',
            count: 10,
            scheduleTimezone: 'Europe/London',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
      },
    };
  }

  validateModel(node) {
    const { freq, interval } = getFrequency(node.getValue('repeatFrequency'));
    const byDay = node.getValue('byDay');
    const byMonth = node.getValue('byMonth');
    const byMonthDay = node.getValue('byMonthDay');
    const startTime = node.getValue('dtStart');
    const endTime = node.getValue('endTime');
    const startDate = node.getValue('startDate');
    const endDate = node.getValue('endDate');
    const count = node.getValue('count');
    const scheduleTimezone = node.getValue('scheduleTimezone');

    const dtStart = getDateTime(startDate, startTime);
    const dtEnd = getDateTime(endDate, endTime);

    const rruleOptions = { freq, interval }; // this is the only required one
    if (typeof byDay !== 'undefined') {
      rruleOptions.byweekday = byDay;
    }
    if (typeof byMonth !== 'undefined') {
      rruleOptions.bymonth = byMonth;
    }
    if (typeof byMonthDay !== 'undefined') {
      rruleOptions.bymonthday = byMonthDay;
    }
    if (typeof dtStart !== 'undefined') {
      rruleOptions.dtstart = dtStart;
    }
    if (typeof dtEnd !== 'undefined') {
      rruleOptions.until = dtEnd;
    }
    if (typeof count !== 'undefined') {
      rruleOptions.count = count;
    }
    if (typeof scheduleTimezone !== 'undefined') {
      rruleOptions.tzid = scheduleTimezone;
    }

    const errors = [];
    try {
      new RRule(rruleOptions); // eslint-disable-line no-new
    } catch (error) {
      errors.push(
        this.createError('default', {
          error,
          path: node,
        }),
      );
    }

    return errors;
  }
};
