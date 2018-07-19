

const CountryCodeFormatRule = require('./country-code-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('CountryCodeFormatRule', () => {
  const rule = new CountryCodeFormatRule();

  const model = new Model({
    type: 'Event',
    fields: {
      country: {
        fieldName: 'country',
        sameAs: 'http://schema.org/addressCountry',
        requiredType: 'http://schema.org/Text',
      },
    },
  });

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  // ISO3166-1-ALPHA2
  it('should return no error for an valid country code', () => {
    const values = [
      'GB',
      'CN',
      'US',
    ];

    for (const value of values) {
      const data = {
        country: value,
      };
      const errors = rule.validate(data, model, null);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid country code', () => {
    const values = [
      'BC',
      'QB',
      'ZY',
      'A',
    ];

    for (const value of values) {
      const data = {
        country: value,
      };
      const errors = rule.validate(data, model, null);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
