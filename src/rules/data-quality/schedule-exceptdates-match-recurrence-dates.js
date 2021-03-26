const { RRule } = require('rrule');
const Rule = require('../rule');
const generateRRuleOptions = require('../../helpers/rrule-options');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const getScheduleProperties = require('../../helpers/schedule-properties');

module.exports = class ExceptDatesAreInSchedule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Schedule'];
    this.meta = {
      name: 'ExceptDatesAreInSchedule',
      description:
        'Validates that the Schedule contains exceptDates that are part of the recurrence rule.',
      tests: {
        exDate: {
          message:
            '{{value}} must be one of the events generated by the recurrence rule.',
          sampleValues: {
            startTime: '08:30',
            endTime: '09:30',
            startDate: '2021-03-19',
            repeatFrequency: 'P1W',
            count: 10,
            exceptDates: ['2021-03-26T08:30:00Z'],
            scheduleTimezone: 'Europe/London',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
      },
    };
  }

  validateModel(node) {
    const errors = [];

    const properties = getScheduleProperties(node);
    const rruleOptions = generateRRuleOptions(properties);

    if (typeof properties.exceptDate === 'undefined') {
      return [];
    }

    try {
      const rule = new RRule(rruleOptions);
      const allEvents = rule.all();
      const simplifiedAllEvents = allEvents.map(event => event.getTime());
      for (const date of properties.exceptDate) {
        const simplifiedDate = new Date(date).getTime();
        if (!simplifiedAllEvents.includes(simplifiedDate)) {
          errors.push(
            this.createError('exDate', {
              value: date,
              path: node,
            }),
          );
        }
      }
    } catch (error) {
      return [];
    }

    return errors;
  }
};
