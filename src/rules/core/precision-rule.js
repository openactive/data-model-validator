const Rule = require('../rule');
const PrecisionHelper = require('../../helpers/precision');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class PrecisionRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that all fields are to the correct number of decimal places.';
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    if (!node.model.hasField(field)) {
      return [];
    }
    if (typeof (node.value[field]) !== 'number') {
      return [];
    }

    const errors = [];

    // Get the field object
    const fieldObj = node.model.getField(field);
    const fieldValue = fieldObj.getMappedValue(node.value);

    if (
      typeof fieldObj.minDecimalPlaces !== 'undefined'
      && PrecisionHelper.getPrecision(fieldValue) < fieldObj.minDecimalPlaces
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.INVALID_PRECISION,
            message: `This field should have at least ${fieldObj.minDecimalPlaces} decimal places. Note that this notice will also appear when trailing zeros have been truncated.`,
            value: fieldValue,
            severity: ValidationErrorSeverity.SUGGESTION,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
    }
    if (typeof fieldObj.maxDecimalPlaces !== 'undefined'
      && PrecisionHelper.getPrecision(fieldValue) > fieldObj.maxDecimalPlaces
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.INVALID_PRECISION,
            message: `This field should not exceed ${fieldObj.maxDecimalPlaces} decimal places.`,
            value: fieldValue,
            severity: ValidationErrorSeverity.WARNING,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
    }

    return errors;
  }
};
