const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AvailableChannelPrepaymentRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Offer: 'availableChannel' };
    this.meta = {
      name: 'AvailableChannelPrepaymentRule',
      description: 'Validates if oa:prepayment is https://openactive.io/Required or https://openactive.io/Optional, then oa:availableChannel must contain at least one of https://openactive.io/OpenBookingPrepayment, https://openactive.io/TelephonePrepayment or https://openactive.io/OnlinePrepayment',
      tests: {
        default: {
          message: 'The `{{availableChannel}}` does not contain a valid available channel when prepayment is required or optional.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
      },
    };
  }

  validateField(node, field) {
    const errors = [];

    const prepaymentValue = node.getValue('prepayment');
    const availableChannels = node.getValue(field);

    if (['https://openactive.io/Required', 'https://openactive.io/Optional'].includes(prepaymentValue)) {
      const validAvailableChannels = ['https://openactive.io/OpenBookingPrepayment', 'https://openactive.io/TelephonePrepayment', 'https://openactive.io/OnlinePrepayment'];
      const validAndPresentAvailableChannels = validAvailableChannels.filter((x) => availableChannels.includes(x));
      if (validAndPresentAvailableChannels.length === 0) {
        errors.push(
          this.createError(
            'default',
            {
              value: availableChannels,
              path: node.getPath('availableChannel'),
            },
            {
              availableChannel: availableChannels,
            },
          ),
        );
      }
    }

    return errors;
  }
};
