const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class IsAccessibleForFreeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.description = 'Validates that isAccessibleForFree is set to true for events that have a zero-price offer.';
  }

  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    if (
      typeof node.value.isAccessibleForFree !== 'undefined'
      && node.value.isAccessibleForFree === true
    ) {
      return [];
    }
    const errors = [];
    const offersValue = node.getValueWithInheritance('offers');
    if (
      typeof offersValue === 'undefined'
      || !(offersValue instanceof Array)
    ) {
      return [];
    }
    for (const offer of offersValue) {
      if (
        typeof offer !== 'undefined'
        && typeof offer.price !== 'undefined'
        && offer.price === 0
      ) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.DATA_QUALITY,
              type: ValidationErrorType.MISSING_IS_ACCESSIBLE_FOR_FREE,
              value: node.value,
              severity: ValidationErrorSeverity.WARNING,
              path: `${node.getPath()}`,
            },
          ),
        );
        break;
      }
    }
    return errors;
  }
};
