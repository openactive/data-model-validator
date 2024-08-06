const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AssumeEventStatusRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'CourseInstance', 'EventSeries', 'HeadlineEvent', 'ScheduledSession', 'SessionSeries'];
    this.targetValidationModes = [
      'RPDEFeed',
      'BookableRPDEFeed',
      'C1Response',
      'C1ResponseOrderItemError',
      'C2Response',
      'C2ResponseOrderItemError',
      'PResponse',
      'PResponseOrderItemError',
      'BResponse',
      'BResponseOrderItemError',
    ];
    this.meta = {
      name: 'AssumeEventStatusRule',
      description: 'Generates a notice for how data consumers wil interpret an Event without a valid eventStatus.',
      tests: {
        default: {
          message: 'Data consumers will assume the `eventStatus` is scheduled if not specified or invalid.\n\nThis `{{model}}` is currently assumed to have the equivalent of:\n\n```\n"eventStatus": "https://schema.org/EventScheduled"\n```',
          sampleValues: {
            model: 'Event',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: ValidationErrorType.CONSUMER_ASSUME_EVENT_STATUS,
        },
      },
    };
  }

  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    const testValue = node.getValueWithInheritance('eventStatus');
    if (typeof testValue === 'undefined'
      || (
        typeof node.model.fields.eventStatus !== 'undefined'
        && typeof node.model.fields.eventStatus.options !== 'undefined'
        && node.model.fields.eventStatus.options.indexOf(testValue) < 0
      )
    ) {
      errors.push(
        this.createError(
          'default',
          {
            value: testValue,
            path: node.getPath(node.getMappedFieldName('eventStatus') || 'eventStatus'),
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
