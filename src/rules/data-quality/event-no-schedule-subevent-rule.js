const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class EventNoScheduleSubeventRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.meta = {
      name: 'EventNoScheduleSubeventRule',
      description: 'Validates that an Event is doesn\'t contain an eventSchedule or a subEvent.',
      tests: {
        default: {
          description: 'Raises a warning if an Event is found to contain an eventSchedule or a subEvent.',
          message: 'The property `{{field}}` was found on type `Event`. If you\'re grouping multiple events together, did you know that there are more specific types you can use, such as `ScheduledSeries`, `CourseInstance` and `EventSeries`?',
          sampleValues: {
            field: 'eventSchedule',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.INVALID_TYPE,
        },
      },
    };
  }

  validateModel(node) {
    const errors = [];

    if (node.model.type === 'Event') {
      const fields = [
        'eventSchedule',
        'subEvent',
      ];
      for (const field of fields) {
        const sample = node.getValue(field);
        if (typeof sample !== 'undefined') {
          errors.push(
            this.createError(
              'default',
              {
                value: node.value,
                path: node.getPath(),
              },
              {
                field,
              },
            ),
          );
          break;
        }
      }
    }

    return errors;
  }
};
