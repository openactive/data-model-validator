const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class MaxLessThenMinRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['QuantitativeValue'];
    this.description = 'Validates that minValue is less than or equal to the maxValue of a QuantitativeValue.';
  }

  validateModel(node) {
    const minValue = node.getValueWithInheritance('minValue');
    const maxValue = node.getValueWithInheritance('maxValue');
    if (typeof minValue === 'undefined'
        || typeof maxValue === 'undefined'
    ) {
      return [];
    }
    const errors = [];

    if (maxValue < minValue) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.MIN_VALUE_GREATER_THAN_MAX_VALUE,
            value: minValue,
            severity: ValidationErrorSeverity.WARNING,
            path: `${node.getPath()}.minValue`,
          },
        ),
      );
    }

    return errors;
  }
};
