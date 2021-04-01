const Rule = require('../rule');
const DataModelHelper = require('../../helpers/data-model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ScheduleEventTypeIsEventSubclass extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = 'Schedule';
    this.meta = {
      name: 'ScheduleEventTypeIsEventSubclass',
      description: 'The `scheduleEventType` in the `Schedule` is not a subclass of `Event`.',
      tests: {
        modelNotRecognised: {
          message: 'The model described by `scheduleEventType` ({{value}}) is not a valid model type. See the [Inheritence Overview](https://developer.openactive.io/publishing-data/data-feeds/types-of-feed#schema-org-type-inheritance-overview) for more information.',
          sampleValues: {
            value: 'BigSwimEvent',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_SCHEDULE_EVENT_TYPE,
        },
        modelHasNoSubClassGraph: {
          message: 'The model described by `scheduleEventType` ({{value}}) does not list any subclass types. See the [Inheritence Overview](https://developer.openactive.io/publishing-data/data-feeds/types-of-feed#schema-org-type-inheritance-overview) for more information.',
          sampleValues: {
            value: 'DownloadData',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_SCHEDULE_EVENT_TYPE,
        },
        modelIsNotEventSubClass: {
          message: 'The `scheduleEventType` ({{value}}) in `Schedule` does not inherit from `Event`. See the [Inheritence Overview](https://developer.openactive.io/publishing-data/data-feeds/types-of-feed#schema-org-type-inheritance-overview) for more information.',
          sampleValues: {
            value: 'ScheduledSession',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_SCHEDULE_EVENT_TYPE,
        },
      },
    };
  }

  validateModel(node) {
    const errors = [];
    let model;
    let errorCondition;
    const scheduledEventType = node.getValue('scheduledEventType');

    try {
      model = DataModelHelper.loadModel(scheduledEventType, 'latest');
    } catch (error) {
      model = undefined;
    }

    if (typeof model === 'undefined') {
      errorCondition = 'modelNotRecognised';
    } else if (typeof model.subClassGraph === 'undefined') {
      errorCondition = 'modelHasNoSubClassGraph';
    } else if (model.subClassGraph.indexOf('#Event') === -1) {
      errorCondition = 'modelIsNotEventSubClass';
    }

    if (errorCondition) {
      errors.push(
        this.createError(
          errorCondition,
          {
            value: scheduledEventType,
            path: node.getPath('scheduledEventType'),
          },
        ),
      );
    }

    return errors;
  }
};
