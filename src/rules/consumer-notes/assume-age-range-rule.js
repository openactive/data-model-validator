const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AssumeAgeRangeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.meta = {
      name: 'AssumeAgeRangeRule',
      description: 'Generates a notice for various ageRange combinations on Event.',
      tests: {
        noAgeRange: {
          description: 'Generates a notice that informs how a data consumer will interpret an Event with no age range.',
          message: 'Data consumers will assume the age range is 18+ when not specified.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE,
        },
        noMinValue: {
          description: 'Generates a notice that informs how a data consumer will interpret an Event with an age range with no minValue.',
          message: 'Data consumers will assume the age range has no minimum age if no minValue is specified.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE,
        },
        noMaxValue: {
          description: 'Generates a notice that informs how a data consumer will interpret an Event with an age range with no maxValue.',
          message: 'Data consumers will assume the age range has no maximum age if no maxValue is specified.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE,
        },
        noMaxValueMinValueZero: {
          description: 'Generates a notice that informs how a data consumer will interpret an Event with an age range with no maxValue and a minValue of zero.',
          message: 'Data consumers will assume the age range is suitable for all if minValue is 0 and no maxValue is specified.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE,
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
    const testValue = node.getValueWithInheritance('ageRange');
    let noticeKey = null;
    if (typeof testValue === 'undefined') {
      noticeKey = 'noAgeRange';
    } else if (typeof testValue !== 'undefined') {
      if (
        (
          typeof testValue.minValue === 'undefined'
          || testValue.minValue === null
        )
        && typeof testValue.maxValue !== 'undefined'
        && testValue.maxValue !== null
      ) {
        noticeKey = 'noMinValue';
      } else if (
        typeof testValue.maxValue === 'undefined'
        || testValue.maxValue === null
      ) {
        if (
          typeof testValue.minValue !== 'undefined'
          && testValue.minValue !== null
        ) {
          if (testValue.minValue !== 0) {
            noticeKey = 'noMaxValue';
          } else {
            noticeKey = 'noMaxValueMinValueZero';
          }
        }
      }
    }

    if (noticeKey !== null) {
      errors.push(
        this.createError(
          noticeKey,
          {
            value: testValue,
            path: node.getPath('ageRange'),
          },
        ),
      );
    }
    return errors;
  }
};
