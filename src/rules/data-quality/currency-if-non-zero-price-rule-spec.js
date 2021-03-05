const CurrencyIfNonZeroPriceRule = require('./currency-if-non-zero-price-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('CurrencyIfNonZeroPriceRule', () => {
  let models;
  let rule;

  beforeEach(() => {
    models = {
      Offer: new Model({
        type: 'Offer',
        inSpec: [
          'price',
          'priceCurrency',
        ],
      }, 'latest'),
      OfferOverride: new Model({
        type: 'OfferOverride',
        inSpec: [
          'price',
          'priceCurrency',
        ],
      }, 'latest'),
      TaxChargeSpecification: new Model({
        type: 'TaxChargeSpecification',
        inSpec: [
          'price',
          'priceCurrency',
        ],
      }, 'latest'),
      PriceSpecification: new Model({
        type: 'PriceSpecification',
        inSpec: [
          'price',
          'priceCurrency',
        ],
      }, 'latest'),
    };
    rule = new CurrencyIfNonZeroPriceRule();
  });

  it('should target Offer models', () => {
    let isTargeted = rule.isModelTargeted(models.Offer);
    expect(isTargeted).toBe(true);
    isTargeted = rule.isModelTargeted(models.OfferOverride);
    expect(isTargeted).toBe(true);
    isTargeted = rule.isModelTargeted(models.TaxChargeSpecification);
    expect(isTargeted).toBe(true);
    isTargeted = rule.isModelTargeted(models.PriceSpecification);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the Offer has a price of zero', async () => {
    const dataItems = [
      {
        '@type': 'Offer',
        price: 0,
      },
      {
        '@type': 'OfferOverride',
        price: 0,
      },
      {
        '@type': 'TaxChargeSpecification',
        price: 0,
      },
      {
        '@type': 'PriceSpecification',
        price: 0,
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        models[data['@type']],
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    }
  });

  it('should return no errors if the Offer has a non-zero price, but has a currency set', async () => {
    const dataItems = [
      {
        '@type': 'Offer',
        price: 0,
        priceCurrency: 'GBP',
      },
      {
        '@type': 'OfferOverride',
        price: 0,
        priceCurrency: 'GBP',
      },
      {
        '@type': 'TaxChargeSpecification',
        price: 0,
        priceCurrency: 'GBP',
      },
      {
        '@type': 'PriceSpecification',
        price: 0,
        priceCurrency: 'GBP',
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        models[data['@type']],
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    }
  });

  it('should return an error if the Offer has a non-zero price, and has no currency set', async () => {
    const dataItems = [
      {
        '@type': 'Offer',
        price: 5,
      },
      {
        '@type': 'OfferOverride',
        price: 5,
      },
      {
        '@type': 'TaxChargeSpecification',
        price: 5,
      },
      {
        '@type': 'PriceSpecification',
        price: 5,
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        models[data['@type']],
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });
});
