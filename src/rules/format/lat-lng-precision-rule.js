const Rule = require('../rule');
const PrecisionHelper = require('../../helpers/precision');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class LatLngPrecisionRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = {
      GeoCoordinates: ['latitude', 'longitude'],
    };
    this.meta = {
      name: 'LatLngPrecisionRule',
      description: 'Validates that latitude and longitude properties are to the correct number of decimal places.',
      tests: {
        belowMinimum: {
          description: 'Raises a suggestion if a number\'s precision is below the minimum number of decimal places suggested for a property.',
          message: 'The value of this property should have at least {{minDecimalPlaces}} decimal places. Note that this notice will also appear when trailing zeros have been truncated.',
          sampleValues: {
            minDecimalPlaces: 2,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
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

    if (
      typeof fieldObj.minDecimalPlaces !== 'undefined'
      && PrecisionHelper.getPrecision(fieldValue) < fieldObj.minDecimalPlaces
    ) {
      errors.push(
        this.createError(
          'belowMinimum',
          {
            value: fieldValue,
            path: node.getPath(field),
          },
          {
            minDecimalPlaces: fieldObj.minDecimalPlaces,
          },
        ),
      );
    }
    return errors;
  }
};
