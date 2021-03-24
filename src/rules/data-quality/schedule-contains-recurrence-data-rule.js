const { RRule } = require('rrule');
const Rule = require('../rule');
const getFrequency = require('../../helpers/frequency-converter');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValidRecurrenceRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = 'Schedule';
    this.meta = {
      name: 'ValidRecurrenceRule',
      description:
        'Validates that the Schedule contains the correct information to generate a valid recurrence rule.',
      tests: {
        default: {
          message:
            'Schedule must contains the correct information to generate a valid recurrence rule.',
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
    const errors = [];

    const { freq, interval } = getFrequency(node.getValue('repeatFrequency'));

    try {
      new RRule({ freq, interval }); // eslint-disable-line no-new
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
