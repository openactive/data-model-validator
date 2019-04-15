const CurrencyIfNonZeroPriceRule = require('./currency-if-non-zero-price-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('CurrencyIfNonZeroPriceRule', () => {
  let model;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'Offer',
      inSpec: [
        'price',
        'priceCurrency',
      ],
    }, 'latest');
    rule = new CurrencyIfNonZeroPriceRule();
  });

  it('should target Offer models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the Offer has a price of zero', async () => {
    const data = {
      type: 'Offer',
      price: 0,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validateAsync(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return no errors if the Offer has a non-zero price, but has a currency set', async () => {
    const data = {
      type: 'Offer',
      price: 5,
      priceCurrency: 'GBP',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validateAsync(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return an error if the Offer has a non-zero price, and has no currency set', async () => {
    const dataItems = [
      {
        type: 'Offer',
        price: 5,
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);

      expect(errors.length).toBe(1);

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });
});
