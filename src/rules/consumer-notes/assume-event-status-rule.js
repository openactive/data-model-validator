const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AssumeEventStatusRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.description = 'Generates a notice for various ageRange combinations on Event.';
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
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.CONSUMER_ASSUME_EVENT_STATUS,
            value: testValue,
            severity: ValidationErrorSeverity.NOTICE,
            path: `${node.getPath()}.eventStatus`,
          },
        ),
      );
    }
    return errors;
  }
};
