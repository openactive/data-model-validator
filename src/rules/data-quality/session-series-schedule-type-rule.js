const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class SessionSeriesScheduleTypeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { SessionSeries: ['eventSchedule'] };
    this.meta = {
      name: 'SessionSeriesScheduleTypeRule',
      description: 'Validates that the eventSchedule of a SessionSeries has an scheduledEventType of ScheduledSession.',
      tests: {
        default: {
          description: 'Raises a failure if the eventSchedule of a SessionSeries does not have an scheduledEventType of ScheduledSession.',
          message: 'The `eventSchedule` of a `SessionSeries` must have an `scheduledEventType` of `"ScheduledSession"`.',
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
      && fieldValue instanceof Array
    ) {
      let index = 0;
      for (const indexValue of fieldValue) {
        if (
          PropertyHelper.getObjectField(indexValue, 'scheduledEventType', node.options.version) !== 'ScheduledSession'
        ) {
          errors.push(
            this.createError(
              'default',
              {
                value: PropertyHelper.getObjectField(fieldValue, 'scheduledEventType', node.options.version),
                path: node.getPath(field, 'scheduledEventType', index),
              },
            ),
          );
        }
        index += 1;
      }
    }

    return errors;
  }
};
