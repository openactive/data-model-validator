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

  validateField(data, field, model /* , parent */) {
    if (typeof (model.fields[field]) === 'undefined') {
      return [];
    }
    const errors = [];
    const fieldObj = new Field(model.fields[field]);
    if (fieldObj.sameAs === 'http://schema.org/addressCountry') {
      if (!validator.isISO31661Alpha2(data[field])) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.INVALID_FORMAT,
              message: 'Country codes should be expressed as per the assigned codes in ISO 3166-1 Alpha 2',
              value: data[field],
              severity: ValidationErrorSeverity.FAILURE,
              path: field,
            },
          ),
        );
      }
    }
    return errors;
  }
};
