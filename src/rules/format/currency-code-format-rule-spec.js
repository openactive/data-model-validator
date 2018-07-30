

const CurrencyCodeFormatRule = require('./currency-code-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('CurrencyCodeFormatRule', () => {
  const rule = new CurrencyCodeFormatRule();

  const model = new Model({
    type: 'Event',
    fields: {
      priceCurrency: {
        fieldName: 'priceCurrency',
        requiredType: 'http://schema.org/Text',
        sameAs: 'http://schema.org/priceCurrency',
      },
    },
  });

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  // ISO4217-3LETTER
  it('should return no error for an valid currency code', () => {
    const values = [
      'GBP',
      'JPY',
      'USD',
    ];

    for (const value of values) {
      const data = {
        priceCurrency: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid currency code', () => {
    const values = [
      'XAA',
      'XAB',
      'GB',
    ];

    for (const value of values) {
      const data = {
        priceCurrency: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid currency code with namespace', () => {
    const values = [
      'XAA',
      'XAB',
      'GB',
    ];

    for (const value of values) {
      const data = {
        'schema:priceCurrency': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
