const validator = require('validator');
const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class CountryCodeFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { PostalAddress: ['addressCountry'] };
    this.meta = {
      name: 'CountryCodeFormatRule',
      description: 'Validates that country code fields are in the correct format.',
      tests: {
        default: {
          description: 'Validates that country code fields are in the correct format.',
          message: 'Country codes should be expressed as per the assigned codes in ISO 3166-1 Alpha 2.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
        ukDetected: {
          description: 'If the country code passed is "UK", provides a hint that it should be "GB".',
          message: 'Country codes should be expressed as per the assigned codes in ISO 3166-1 Alpha 2. In this standard, "UK" should be "GB".',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  validateField(node, field) {
    const fieldObj = node.model.getField(field);
    if (typeof fieldObj === 'undefined') {
      return [];
    }
    const fieldValue = node.getValue(field);
    const errors = [];
    if (!validator.isISO31661Alpha2(fieldValue)) {
      errors.push(
        this.createError(
          fieldValue.toLowerCase().trim() === 'uk' ? 'ukDetected' : 'default',
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
