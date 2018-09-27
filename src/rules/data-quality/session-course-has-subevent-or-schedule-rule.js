const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class SessionCourseHasSubeventOrScheduleRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['SessionSeries', 'CourseInstance'];
    this.meta = {
      name: 'SessionCourseHasSubeventOrScheduleRule',
      description: 'Validates that a SessionSeries or CourseInstance has either an eventSchedule or at least one subEvent.',
      tests: {
        default: {
          description: 'Raises a failure if a SessionSeries or CourseInstance doesn\'t have either an eventSchedule or at least one subEvent.',
          message: 'A `{{model}}` must have an `eventSchedule` or at least one `subEvent`.',
          sampleValues: {
            model: 'SessionSeries',
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

    const eventScheduleValue = node.getValue('eventSchedule');
    const subEventValue = node.getValue('subEvent');

    if (
      (
        typeof eventScheduleValue === 'undefined'
        || (
          eventScheduleValue instanceof Array
          && eventScheduleValue.length === 0
        )
      )
      && (
        typeof subEventValue === 'undefined'
        || (
          subEventValue instanceof Array
          && subEventValue.length === 0
        )
      )
      && node.name !== 'superEvent'
    ) {
      errors.push(
        this.createError(
          'default',
          {
            value: node.value,
            path: node.getPath(),
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
