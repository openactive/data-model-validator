const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AddressWarningRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Place: 'address' };
    this.meta = {
      name: 'AddressWarningRule',
      description: 'Raises a warning about the use of data if the address property is not a PostalAddress',
      tests: {
        default: {
          message: 'Not including components within your address field limits the potential use of your data. For example, Google Reserve requires streetAddress, addressLocality, addressRegion, postalCode and addressCountry to all be provided.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.TYPE_LIMITS_USE,
        },
      },
    };
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const address = node.getValue(field);
    const errors = [];

    if (
      typeof address !== 'object'
      && typeof address !== 'undefined'
    ) {
      errors.push(
        this.createError(
          'default',
          {
            value: address,
            path: node.getPath(),
          },
        ),
      );
    }

    return errors;
  }
};
