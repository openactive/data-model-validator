const Rule = require('../rule');
const PrecisionHelper = require('../../helpers/precision');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class PrecisionRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'PrecisionRule',
      description: 'Validates that all properties are to the correct number of decimal places.',
      tests: {
        aboveMaximum: {
          description: 'Raises a warning if a number\'s precision is above the maximum number of decimal places required for a property.',
          message: 'The value of this property must not exceed {{maxDecimalPlaces}} decimal places.',
          sampleValues: {
            maxDecimalPlaces: 2,
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.INVALID_PRECISION,
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
    const fieldValue = node.getMappedValue(field);

    if (typeof fieldValue !== 'number') {
      return [];
    }

    if (typeof fieldObj.maxDecimalPlaces !== 'undefined'
      && PrecisionHelper.getPrecision(fieldValue) > fieldObj.maxDecimalPlaces
    ) {
      errors.push(
        this.createError(
          'aboveMaximum',
          {
            value: fieldValue,
            path: node.getPath(field),
          },
          {
            maxDecimalPlaces: fieldObj.maxDecimalPlaces,
          },
        ),
      );
    }

    return errors;
  }
};
