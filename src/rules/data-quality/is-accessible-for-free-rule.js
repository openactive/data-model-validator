const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class IsAccessibleForFreeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'CourseInstance', 'EventSeries', 'HeadlineEvent', 'ScheduledSession', 'SessionSeries'];
    this.meta = {
      name: 'IsAccessibleForFreeRule',
      description: 'Validates that isAccessibleForFree is set to true for events that have a zero-price offer.',
      tests: {
        default: {
          message: 'Where a `{{model}}` has at least one `Offer` with `price` set to `0`, it should also have a property named `isAccessibleForFree` set to `true`.\n\nFor example:\n\n```\n{\n  "@type": "{{model}}",\n  "offers": [\n    {\n      "@type": "Offer",\n      "price": 0\n    }\n  ],\n  "isAccessibleForFree": true\n}\n```',
          sampleValues: {
            model: 'Event',
          },
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
    const isAccessibleForFree = node.getMappedValue('isAccessibleForFree');
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
        const offerPrice = PropertyHelper.getObjectField(offer, 'price', node.options.version);
        if (
          typeof offerPrice !== 'undefined'
          && offerPrice === 0
        ) {
          errors.push(
            this.createError(
              'default',
              {
                value: isAccessibleForFree,
                path: node.getPath(node.getMappedFieldName('isAccessibleForFree') || 'isAccessibleForFree'),
              },
              {
                model: node.model.type,
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
