const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AddressTrailingCommaRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = {
      PostalAddress: ['streetAddress', 'addressLocality', 'addressRegion', 'addressCountry', 'postalCode'],
    };
    this.meta = {
      name: 'AddressTrailingCommaRule',
      description: 'Validates that address properties don\'t end with trailing commas.',
      tests: {
        default: {
          message: 'Address properties should not have a trailing comma.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.ADDRESS_HAS_TRAILING_COMMA,
        },
      },
    };
  }

  validateField(node, field) {
    const errors = [];
    const fieldValue = node.getValue(field);
    if (
      typeof fieldValue !== 'undefined'
      && fieldValue.match(/,\s*$/)
    ) {
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
    return errors;
  }
};
