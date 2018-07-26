const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AssumeAgeRangeRule extends Rule {
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
    let message = null;
    const testValue = node.getValueWithInheritance('ageRange');
    if (typeof testValue === 'undefined') {
      message = 'Data consumers will assume the age range is 18+ when not specified';
    } else if (typeof testValue !== 'undefined') {
      if (
        (
          typeof testValue.minValue === 'undefined'
          || testValue.minValue === null
        )
        && typeof testValue.maxValue !== 'undefined'
        && testValue.maxValue !== null
      ) {
        message = 'Data consumers will assume the age range has no minimum age if no minValue is specified';
      } else if (
        typeof testValue.maxValue === 'undefined'
        || testValue.maxValue === null
      ) {
        if (
          typeof testValue.minValue !== 'undefined'
          && testValue.minValue !== null
        ) {
          if (testValue.minValue === 0) {
            message = 'Data consumers will assume the age range has no maximum age if no maxValue is specified';
          } else {
            message = 'Data consumers will assume the age range is suitable for all if minValue is 0 and no maxValue is specified';
          }
        }
      }
    }

    if (message !== null) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            message,
            type: ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE,
            value: testValue,
            severity: ValidationErrorSeverity.SUGGESTION,
            path: `${node.getPath()}.ageRange`,
          },
        ),
      );
    }
    return errors;
  }
};
