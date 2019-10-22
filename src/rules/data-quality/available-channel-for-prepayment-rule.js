const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AvailableChannelPrepaymentRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Offer'];
    this.meta = {
      name: 'AvailableChannelPrepaymentRule',
      description: 'Validates if oa:prepayment is https://openactive.io/Required or https://openactive.io/Optional, then oa:availableChannel must contain at least one of https://openactive.io/OpenBookingPrepayment, https://openactive.io/TelephonePrepayment or https://openactive.io/OnlinePrepayment',
      tests: {
        default: {
          message: 'The `{{availableChannel}}` is not a valid available channel when prepayment is required or optional.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
      },
    };
  }

  validateModel(node) {
    const errors = [];

    const prepaymentValue = node.getValue('prepayment');

    if (['https://openactive.io/Required', 'https://openactive.io/Optional'].includes(prepaymentValue)) {
      const availableChannelValue = node.getValue('availableChannel');
      const validAvailableChannelsForPrepayment = ['https://openactive.io/OpenBookingPrepayment', 'https://openactive.io/TelephonePrepayment', 'https://openactive.io/OnlinePrepayment'];
      if (!validAvailableChannelsForPrepayment.includes(availableChannelValue)) {
        errors.push(
          this.createError(
            'default',
            {
              value: availableChannelValue,
              path: node.getPath('availableChannel'),
            },
            {
              availableChannel: availableChannelValue,
            },
          ),
        );
      }
    }

    return errors;
  }
};
