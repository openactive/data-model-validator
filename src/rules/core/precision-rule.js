const Rule = require('../rule');
const PrecisionHelper = require('../../helpers/precision');
const Field = require('../../classes/field');
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
    if (typeof (node.model.fields[field]) === 'undefined') {
      return [];
    }
    if (typeof (node.value[field]) !== 'number') {
      return [];
    }

    const errors = [];

    // Get the field object
    const fieldObj = new Field(node.model.fields[field]);

    if (
      typeof fieldObj.minDecimalPlaces !== 'undefined'
      && PrecisionHelper.getPrecision(node.value[field]) < fieldObj.minDecimalPlaces
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.INVALID_PRECISION,
            message: `This field should have at least ${fieldObj.minDecimalPlaces} decimal places. Note that this notice will also appear when trailing zeros have been truncated.`,
            value: node.value[field],
            severity: ValidationErrorSeverity.SUGGESTION,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
    }
    if (typeof fieldObj.maxDecimalPlaces !== 'undefined'
      && PrecisionHelper.getPrecision(node.value[field]) > fieldObj.maxDecimalPlaces
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.INVALID_PRECISION,
            message: `This field should not exceed ${fieldObj.maxDecimalPlaces} decimal places.`,
            value: node.value[field],
            severity: ValidationErrorSeverity.WARNING,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
    }

    return errors;
  }
};
