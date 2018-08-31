const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class SessionSeriesScheduleTypeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { SessionSeries: ['eventSchedule'] };
    this.meta = {
      name: 'SessionSeriesScheduleTypeRule',
      description: 'Validates that the eventSchedule of a SessionSeries has an instanceType of ScheduledSession.',
      tests: {
        default: {
          description: 'Raises a failure if the eventSchedule of a SessionSeries doesn not have an instanceType of ScheduledSession.',
          message: 'The eventSchedule of a SessionSeries must have an instanceType of "ScheduledSession".',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
      },
    };
  }

  validateField(node, field) {
    const errors = [];

    const fieldValue = node.getValue(field);

    if (
      typeof fieldValue === 'object'
      && !(fieldValue instanceof Array)
      && fieldValue.instanceType !== 'ScheduledSession'
    ) {
      errors.push(
        this.createError(
          'default',
          {
            value: fieldValue.instanceType,
            path: node.getPath(field, 'instanceType'),
          },
        ),
      );
    }

    return errors;
  }
};
