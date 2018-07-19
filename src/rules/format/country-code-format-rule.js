const validator = require('validator');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class CountryCodeFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that country code fields are in the correct format.';
  }

  validateField(node, field) {
    if (typeof (node.model.fields[field]) === 'undefined') {
      return [];
    }
    const errors = [];
    const fieldObj = new Field(node.model.fields[field]);
    if (fieldObj.sameAs === 'http://schema.org/addressCountry') {
      if (!validator.isISO31661Alpha2(node.value[field])) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.INVALID_FORMAT,
              message: 'Country codes should be expressed as per the assigned codes in ISO 3166-1 Alpha 2',
              value: node.value[field],
              severity: ValidationErrorSeverity.FAILURE,
              path: `${node.getPath()}.${field}`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
