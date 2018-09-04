const cc = require('currency-codes');
const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class CurrencyCodeFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'CurrencyCodeFormatRule',
      description: 'Validates that currency code properties are in the correct format.',
      tests: {
        default: {
          message: 'Currency codes must be expressed as per the assigned [3-letter codes in ISO 4217](https://en.wikipedia.org/wiki/ISO_4217). For example `"GBP"`.',
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
    const errors = [];
    if (fieldObj.sameAs === 'https://schema.org/priceCurrency') {
      const fieldValue = node.getValue(field);
      if (typeof (cc.code(fieldValue)) === 'undefined') {
        errors.push(
          this.createError(
            'default',
            {
              value: fieldValue,
              path: node.getPath(field),
            },
          ),
        );
      }
    }
    return errors;
  }
};
