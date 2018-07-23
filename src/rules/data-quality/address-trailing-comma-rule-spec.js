const AddressTrailingCommaRule = require('./address-trailing-comma-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('AddressTrailingCommaRule', () => {
  const rule = new AddressTrailingCommaRule();

  const model = new Model({
    type: 'PostalAddress',
    fields: {
      addressCountry: {
        fieldName: 'addressCountry',
        requiredType: 'http://schema.org/Text',
      },
      addressLocality: {
        fieldName: 'addressLocality',
        requiredType: 'http://schema.org/Text',
      },
      addressRegion: {
        fieldName: 'addressRegion',
        requiredType: 'http://schema.org/Text',
      },
      postalCode: {
        fieldName: 'postalCode',
        requiredType: 'http://schema.org/Text',
      },
      streetAddress: {
        fieldName: 'streetAddress',
        requiredType: 'http://schema.org/Text',
      },
    },
  });

  it('should target PostalAddress fields', () => {
    const isTargeted = rule.isFieldTargeted(model, 'streetAddress');
    expect(isTargeted).toBe(true);
  });

  it('should return no error when an address has no trailing commas', () => {
    const data = {
      type: 'PostalAddress',
      streetAddress: '1, Test Road',
      addressLocality: 'Test Locality',
      addressRegion: 'Testshire',
      addressCountry: 'GB',
      postalCode: 'TE5 1AB',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return an error when an address has trailing commas', () => {
    const data = {
      type: 'PostalAddress',
      streetAddress: '1, Test Road,',
      addressLocality: 'Test Locality, ',
      addressRegion: 'Testshire,',
      addressCountry: 'GB,',
      postalCode: 'TE5 1AB,',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(5);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.ADDRESS_HAS_TRAILING_COMMA);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
