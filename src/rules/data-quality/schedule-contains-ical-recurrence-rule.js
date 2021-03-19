const { RRule } = require('rrule');
const Rule = require('../rule');
const getFrequency = require('../../helpers/frequency-converter');
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
            'scheduleTimezone must be present when startTime or endTime are present',
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
    const { freq, interval } = getFrequency(node.getValue('repeatFrequency'));
    const byDay = node.getValue('byDay');
    const byMonth = node.getValue('byMonth');
    const byMonthDay = node.getValue('byMonthDay');
    const dtStart = node.getValue('dtStart');
    const until = node.getValue('until');
    const count = node.getValue('count');
    const scheduleTimezone = node.getValue('scheduleTimezone');

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
    if (typeof until !== 'undefined') {
      rruleOptions.until = until;
    }
    if (typeof count !== 'undefined') {
      rruleOptions.count = count;
    }
    if (typeof scheduleTimezone !== 'undefined') {
      rruleOptions.tzid = scheduleTimezone;
    }

    const errors = [];
    // const rruleSet = new RRule.RRuleSet();
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
