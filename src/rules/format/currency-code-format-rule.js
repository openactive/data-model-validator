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
      description: 'Validates that currency code fields are in the correct format.',
      tests: {
        default: {
          message: 'Currency codes should be expressed as per the assigned 3-letter codes in ISO 4217.',
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
    if (fieldObj.sameAs === 'http://schema.org/priceCurrency') {
      if (typeof (cc.code(node.value[field])) === 'undefined') {
        errors.push(
          this.createError(
            'default',
            {
              value: node.value[field],
              path: `${node.getPath()}.${field}`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
