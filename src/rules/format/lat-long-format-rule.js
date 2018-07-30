const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class LatLongFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = {
      GeoCoordinates: ['latitude', 'longitude'],
    };
    this.description = 'Validates that latitude and longitude fields are in the correct format.';
    this.errors = {
      latitude: 'Geo latitude points should be expressed as floating point numbers, -90 to 90.',
      longitude: 'Geo longitude points should be expressed as floating point numbers, -180 to 180.',
    };
  }

  validateField(node, field) {
    const errors = [];
    const fieldObj = node.model.getField(field);
    if (typeof fieldObj === 'undefined') {
      return [];
    }
    if (
      typeof (node.value[field]) !== 'number'
      || (fieldObj.fieldName === 'latitude' && (node.value[field] < -90 || node.value[field] > 90))
      || (fieldObj.fieldName === 'longitude' && (node.value[field] < -180 || node.value[field] > 180))
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.CONFORMANCE,
            type: ValidationErrorType.INVALID_FORMAT,
            message: this.errors[fieldObj.fieldName],
            value: node.value[field],
            severity: ValidationErrorSeverity.FAILURE,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
    }
    return errors;
  }
};
