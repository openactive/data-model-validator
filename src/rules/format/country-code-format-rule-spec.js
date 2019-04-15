const CountryCodeFormatRule = require('./country-code-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('CountryCodeFormatRule', () => {
  const rule = new CountryCodeFormatRule();

  const model = new Model({
    type: 'PostalAddress',
    fields: {
      addressCountry: {
        fieldName: 'addressCountry',
        sameAs: 'https://schema.org/addressCountry',
        requiredType: 'https://schema.org/Text',
      },
    },
  }, 'latest');

  it('should target the addressCountry field of PostalAddress', () => {
    const isTargeted = rule.isFieldTargeted(model, 'addressCountry');
    expect(isTargeted).toBe(true);
  });

  // ISO3166-1-ALPHA2
  it('should return no error for an valid country code', async () => {
    const values = [
      'GB',
      'CN',
      'US',
    ];

    for (const value of values) {
      const data = {
        addressCountry: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid country code', async () => {
    const values = [
      'UK',
      'BC',
      'QB',
      'ZY',
      'A',
    ];

    for (const value of values) {
      const data = {
        addressCountry: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid country code with namespace', async () => {
    const values = [
      'UK',
      'BC',
      'QB',
      'ZY',
      'A',
    ];

    for (const value of values) {
      const data = {
        'schema:addressCountry': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
