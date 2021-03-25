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
        dtStart: {
          message:
            'The recurrence rule must contain a startDate, startTime, and scheduledTimezone to generate the schedule.',
          sampleValues: {
            startTime: '08:30',
            startDate: '2021-03-19',
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
    const errors = [];

    const { freq, interval } = getFrequency(node.getValue('repeatFrequency'));
    const byDay = node.getValue('byDay');
    const byMonth = node.getValue('byMonth');
    const byMonthDay = node.getValue('byMonthDay');
    const startDate = node.getValue('startDate');
    const startTime = node.getValue('startTime');
    const endDate = node.getValue('endDate');
    const endTime = node.getValue('endTime');
    const count = node.getValue('count');
    const scheduleTimezone = node.getValue('scheduleTimezone');

    const dtStart = getDateTime(startDate, startTime);
    const dtEnd = getDateTime(endDate, endTime);

    const rruleOptions = { freq, interval }; // this is the only required one

    if (typeof startDate === 'undefined'
        || typeof startTime === 'undefined'
        || typeof scheduleTimezone === 'undefined') {
      errors.push(
        this.createError('dtStart', {
          value: undefined,
          path: node,
        }),
      );
    } else {
      rruleOptions.dtstart = dtStart;
    }

    if (typeof byDay !== 'undefined') {
      rruleOptions.byweekday = byDay;
    }
    if (typeof byMonth !== 'undefined') {
      rruleOptions.bymonth = byMonth;
    }
    if (typeof byMonthDay !== 'undefined') {
      rruleOptions.bymonthday = byMonthDay;
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

    try {
      const rule = new RRule(rruleOptions); // eslint-disable-line no-new
      const firstEvent = rule.all()[0];
      if (firstEvent.getTime() !== dtStart.getTime()) {
        errors.push(
          this.createError('default', {
            error: 'The first event does not match the supplied data.',
            path: node,
          }),
        );
      }
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
