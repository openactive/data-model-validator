

const CurrencyCodeFormatRule = require('./currency-code-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('CurrencyCodeFormatRule', () => {
  const rule = new CurrencyCodeFormatRule();

  const model = new Model({
    type: 'Event',
    fields: {
      currency: {
        fieldName: 'currency',
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
        currency: value,
      };
      const errors = rule.validate(data, model, null);
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
        currency: value,
      };
      const errors = rule.validate(data, model, null);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
