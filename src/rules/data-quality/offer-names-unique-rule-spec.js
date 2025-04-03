const OfferNamesUniqueRule = require('./offer-names-unique-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('OfferNamesUniqueRule', () => {
  const rule = new OfferNamesUniqueRule();

  const model = new Model({
    type: 'Event',
    fields: {
      offers: {
        fieldName: 'offers',
        requiredType: 'ArrayOf#Offer',
      },
    },
  }, 'latest');

  it('should target Offer models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no error when the name is unique', async () => {
    const data = {
      '@type': 'Event',
      offers: [
        {
          '@type': 'Offer',
          name: 'Offer 1',
        },
      ],
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

  it('should return an error when the name is not unique', async () => {
    const data = {
      '@type': 'Event',
      offers: [
        {
          '@type': 'Offer',
          name: 'Offer 1',
        },
        {
          '@type': 'Offer',
          name: 'Offer 1',
        },
      ],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.OFFER_NAMES_NOT_UNIQUE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });
});
