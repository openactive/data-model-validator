const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class OfferNamesUniqueRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.meta = {
      name: 'OfferNamesUniqueRule',
      description: 'Validates that offer names are unique within an opportunity.',
      tests: {
        default: {
          message: 'Offer names must be unique within an opportunity.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.OFFER_NAMES_NOT_UNIQUE,
        },
      },
    };
  }

  validateModel(node) {
    const offers = node.getValueWithInheritance('offers');
    const errors = [];
    if (typeof offers === 'undefined') {
      return errors;
    }
    const uniqueOfferNames = new Set(offers.map((offer) => offer.name));
    if (uniqueOfferNames.size !== offers.length) {
      errors.push(this.createError('default', {
        value: offers,
        path: node.getPath(node.getMappedFieldName('name')),
      }));
    }
    return errors;
  }
};
