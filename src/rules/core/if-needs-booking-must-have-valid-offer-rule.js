const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class IfNeedsBookingMustHaveValidOfferRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.meta = {
      name: 'IfNeedsBookingMustHaveValidOfferRule',
      description: 'Validates that an Event with a isAccessibleWithoutBooking of false has a valid offer with an id or url.',
      tests: {
        default: {
          description: 'Raises a failure if an Event with a isAccessibleWithoutBooking of false has no valid offer with an id or url.',
          message: 'An Event with an isAccessibleWithoutBooking set to false should have at least one Offer with an id or url.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.EVENT_REQUIRING_BOOKING_MUST_HAVE_VALID_OFFER,
        },
      },
    };
  }

  validateModel(node) {
    const errors = [];

    const fieldValue = node.getValue('isAccessibleWithoutBooking');
    if (fieldValue === false) {
      const offers = node.getValueWithInheritance('offers');
      let hasError = true;
      if (typeof offers === 'object' && offers instanceof Array) {
        for (const offer of offers) {
          if (
            typeof PropertyHelper.getObjectField(offer, 'id', node.options.version) === 'string'
            || typeof PropertyHelper.getObjectField(offer, 'url', node.options.version) === 'string'
          ) {
            hasError = false;
            break;
          }
        }
      }
      if (hasError) {
        errors.push(
          this.createError(
            'default',
            {
              value: node.value,
              path: node.getPath(),
            },
          ),
        );
      }
    }

    return errors;
  }
};
