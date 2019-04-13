const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class LatLongFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = {
      GeoCoordinates: ['latitude', 'longitude'],
    };
    this.meta = {
      name: 'LatLongFormatRule',
      description: 'Validates that latitude and longitude properties are in the correct format.',
      tests: {
        latitude: {
          message: 'Geo latitude points must be expressed as floating point numbers, in the range `-90` to `90`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
        longitude: {
          message: 'Geo longitude points must be expressed as floating point numbers, in the range `-180` to `180`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  validateFieldSync(node, field) {
    const errors = [];
    const fieldObj = node.model.getField(field);
    if (typeof fieldObj === 'undefined') {
      return [];
    }
    const fieldValue = node.getValue(field);
    if (
      typeof fieldValue !== 'number'
      || (fieldObj.fieldName === 'latitude' && (fieldValue < -90 || fieldValue > 90))
      || (fieldObj.fieldName === 'longitude' && (fieldValue < -180 || fieldValue > 180))
    ) {
      errors.push(
        this.createError(
          fieldObj.fieldName,
          {
            value: fieldValue,
            path: node.getPath(field),
          },
        ),
      );
    }
    return errors;
  }
};
