const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class MaxLessThenMinRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['QuantitativeValue'];
    this.meta = {
      name: 'MaxLessThenMinRule',
      description: 'Validates that minValue is less than or equal to the maxValue of a QuantitativeValue.',
      tests: {
        default: {
          message: '`minValue` must not be greater than `maxValue`.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.MIN_VALUE_GREATER_THAN_MAX_VALUE,
        },
      },
    };
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
        this.createError(
          'default',
          {
            value: minValue,
            path: node.getPath(node.getMappedFieldName('minValue') || 'minValue'),
          },
        ),
      );
    }

    return errors;
  }
};
