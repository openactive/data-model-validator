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
        requiredType: 'https://schema.org/Text',
      },
      addressLocality: {
        fieldName: 'addressLocality',
        requiredType: 'https://schema.org/Text',
      },
      addressRegion: {
        fieldName: 'addressRegion',
        requiredType: 'https://schema.org/Text',
      },
      postalCode: {
        fieldName: 'postalCode',
        requiredType: 'https://schema.org/Text',
      },
      streetAddress: {
        fieldName: 'streetAddress',
        requiredType: 'https://schema.org/Text',
      },
    },
  }, 'latest');

  it('should target PostalAddress fields', () => {
    const isTargeted = rule.isFieldTargeted(model, 'streetAddress');
    expect(isTargeted).toBe(true);
  });

  it('should return no error when an address has no trailing commas', async () => {
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
    const errors = await rule.validateAsync(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return an error when an address has trailing commas', async () => {
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
    const errors = await rule.validateAsync(nodeToTest);
    expect(errors.length).toBe(5);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.ADDRESS_HAS_TRAILING_COMMA);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
  it('should return an error when an address has trailing commas in namespaced fields', async () => {
    const data = {
      type: 'PostalAddress',
      'schema:streetAddress': '1, Test Road,',
      'schema:addressLocality': 'Test Locality, ',
      'schema:addressRegion': 'Testshire,',
      'schema:addressCountry': 'GB,',
      'https://schema.org/postalCode': 'TE5 1AB,',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validateAsync(nodeToTest);
    expect(errors.length).toBe(5);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.ADDRESS_HAS_TRAILING_COMMA);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
