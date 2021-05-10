const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class MinValueInclusiveRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'MinValueInclusiveRule',
      description: 'Validates that all properties meet the associated minValueInclusive constraint.',
      tests: {
        belowMinimum: {
          description: 'Raises a failure if the value is below the associated minValueInclusive property.',
          message: 'The value of this property must be greater than or equal to {{minValueInclusive}}.',
          sampleValues: {
            minValueInclusive: 4,
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.BELOW_MIN_VALUE_INCLUSIVE,
        },
      },
    };
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    if (!node.model.hasField(field)) {
      return [];
    }

    const errors = [];

    // Get the field object
    const fieldObj = node.model.getField(field);
    const fieldValue = node.getValue(field);

    if (typeof fieldValue !== 'number') {
      return [];
    }

    if (
      typeof fieldObj.minValueInclusive !== 'undefined'
      && fieldValue < fieldObj.minValueInclusive
    ) {
      errors.push(
        this.createError(
          'belowMinimum',
          {
            value: fieldValue,
            path: node.getPath(field),
          },
          {
            minValueInclusive: fieldObj.minValueInclusive,
          },
        ),
      );
    }

    return errors;
  }
};
