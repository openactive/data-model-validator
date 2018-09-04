const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DatesMustHaveDurationRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'CourseInstance', 'EventSeries', 'HeadlineEvent', 'ScheduledSession', 'SessionSeries', 'Schedule'];
    this.meta = {
      name: 'DatesMustHaveDurationRule',
      description: 'Validates that a duration is supplied where both startDate and endDate are given in an Event or Schedule.',
      tests: {
        default: {
          message: 'A duration must be provided when a start date and end date are set.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.DATES_MUST_HAVE_DURATION,
        },
      },
    };
  }

  validateModel(node) {
    const startDate = node.getValueWithInheritance('startDate');
    const endDate = node.getValueWithInheritance('endDate');
    if (typeof startDate === 'undefined'
        || typeof endDate === 'undefined'
    ) {
      return [];
    }
    const errors = [];
    const duration = node.getValueWithInheritance('duration');
    if (typeof duration === 'undefined') {
      errors.push(
        this.createError(
          'default',
          {
            value: undefined,
            path: node.getPath('duration'),
          },
        ),
      );
    }

    return errors;
  }
};
