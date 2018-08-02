const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class IsAccessibleForFreeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.meta = {
      name: 'IsAccessibleForFreeRule',
      description: 'Validates that isAccessibleForFree is set to true for events that have a zero-price offer.',
      tests: {
        default: {
          message: 'Events with at least one zero price offer should have isAccessibleForFree set to true.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.MISSING_IS_ACCESSIBLE_FOR_FREE,
        },
      },
    };
  }

  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const isAccessibleForFree = PropertyHelper.getObjectField(node.value, 'isAccessibleForFree');
    if (
      typeof isAccessibleForFree !== 'undefined'
      && isAccessibleForFree === true
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
      ) {
        const offerPrice = PropertyHelper.getObjectField(offer, 'price');
        if (
          typeof offerPrice !== 'undefined'
          && offerPrice === 0
        ) {
          errors.push(
            this.createError(
              'default',
              {
                value: node.value,
                path: node.getPath(),
              },
            ),
          );
          break;
        }
      }
    }
    return errors;
  }
};
