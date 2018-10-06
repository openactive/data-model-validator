const moment = require('moment');
const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoZeroDurationRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'CourseInstance', 'EventSeries', 'HeadlineEvent', 'ScheduledSession', 'SessionSeries', 'Schedule', 'Slot'];
    this.meta = {
      name: 'NoZeroDurationRule',
      description: 'Validates that a duration is non-zero in an Event or Schedule.',
      tests: {
        default: {
          message: 'A `{{model}}` must have a non-zero duration.',
          sampleValues: {
            model: 'Event',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.NO_ZERO_DURATION,
        },
      },
    };
  }

  validateModel(node) {
    if (!node.hasMappedField('duration')) {
      return [];
    }
    const fieldValue = node.getValue('duration');
    const errors = [];
    if (moment.duration(fieldValue).valueOf() === 0) {
      errors.push(
        this.createError(
          'default',
          {
            value: fieldValue,
            path: node.getPath(node.getMappedFieldName('duration')),
          },
          {
            model: node.model.type,
          },
        ),
      );
    }

    return errors;
  }
};
