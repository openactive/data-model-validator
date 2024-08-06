const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class CurrencyIfNonZeroPriceRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['TaxChargeSpecification', 'PriceSpecification', 'Offer', 'OfferOverride'];
    this.meta = {
      name: 'CurrencyIfNonZeroPriceRule',
      description: 'Validates that a priceCurrency is set if an Offer\'s price is non-zero.',
      tests: {
        default: {
          message: 'A `priceCurrency` is required on an `Offer` containing a non-zero `price`.\n\nYou can fix this by setting a `priceCurrency` field on this `Offer`.\n\ne.g.\n\n```\n{\n  "@type": "{{model}}",\n  "price": {{price}},\n  "priceCurrency": "GBP"\n}\n```',
          sampleValues: {
            model: 'Offer',
            price: 5,
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
      },
    };
  }

  validateModel(node) {
    if (!node.hasMappedField('price') || node.hasMappedField('priceCurrency')) {
      return [];
    }
    const priceValue = node.getMappedValue('price');
    const errors = [];
    if (priceValue !== 0) {
      errors.push(
        this.createError(
          'default',
          {
            value: priceValue,
            path: node.getPath(node.getMappedFieldName('duration')),
          },
          {
            model: node.model.type,
            price: priceValue,
          },
        ),
      );
    }

    return errors;
  }
};
