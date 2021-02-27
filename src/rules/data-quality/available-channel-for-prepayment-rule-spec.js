const AvailableChannelForPrepaymentRule = require('./available-channel-for-prepayment-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('AvailableChannelForPrepaymentRule', () => {
  const rule = new AvailableChannelForPrepaymentRule();

  const model = new Model({
    type: 'Offer',
    fields: {
      availableChannel: {
        fieldName: 'availableChannel',
        requiredType: 'ArrayOf#https://openactive.io/AvailableChannelType',
      },
      prepayment: {
        fieldName: 'prepayment',
        requiredType: 'https://openactive.io/RequiredStatusType',
      },
    },
  }, 'latest');

  it('should target availableChannel field', () => {
    const isTargeted = rule.isFieldTargeted(model, 'availableChannel');
    expect(isTargeted).toBe(true);
  });

  it('should return no error when payment is not set', async () => {
    const data = {
      '@type': 'Offer',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });

  const invalidChannel = 'https://openactive.io/Optional';

  const affectedPrepayments = ['https://openactive.io/Required', 'https://openactive.io/Optional'];
  for (const prepayment of affectedPrepayments) {
    describe(`when payment is ${prepayment}`, () => {
      const validAvailableChannelsForPrepayment = ['https://openactive.io/OpenBookingPrepayment', 'https://openactive.io/TelephonePrepayment', 'https://openactive.io/OnlinePrepayment'];
      for (const validChannel of validAvailableChannelsForPrepayment) {
        it(`should return no error when availableChannel contains ${validChannel}`, async () => {
          const data = {
            '@type': 'Offer',
            prepayment,
            availableChannel: [validChannel, invalidChannel],
          };

          const nodeToTest = new ModelNode(
            '$',
            data,
            null,
            model,
          );
          const errors = await rule.validate(nodeToTest);
          expect(errors.length).toBe(0);
        });
      }

      it('should return an error when availableChannel does not contain a valid value', async () => {
        const data = {
          '@type': 'Offer',
          prepayment,
          availableChannel: [invalidChannel],
        };

        const nodeToTest = new ModelNode(
          '$',
          data,
          null,
          model,
        );
        const errors = await rule.validate(nodeToTest);
        expect(errors.length).toBe(1);
        expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
      });
    });
  }
});
