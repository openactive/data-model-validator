const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AddressTrailingCommaRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = {
      PostalAddress: ['streetAddress', 'addressLocality', 'addressRegion', 'addressCountry', 'postalCode'],
    };
    this.description = 'Validates that address fields don\'t end with trailing commas.';
  }

  validateField(node, field) {
    const errors = [];
    if (
      typeof (node.value[field]) !== 'undefined'
      && node.value[field].match(/,\s*$/)
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.ADDRESS_HAS_TRAILING_COMMA,
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
