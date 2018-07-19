const cc = require('currency-codes');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class CurrencyCodeFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that currency code fields are in the correct format.';
  }

  validateField(data, field, model /* , parent */) {
    if (typeof (model.fields[field]) === 'undefined') {
      return [];
    }
    const errors = [];
    const fieldObj = new Field(model.fields[field]);
    if (fieldObj.sameAs === 'http://schema.org/priceCurrency') {
      if (typeof (cc.code(data[field])) === 'undefined') {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.INVALID_FORMAT,
              message: 'Currency codes should be expressed as per the assigned 3-letter codes in ISO 4217',
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
