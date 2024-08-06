const AddressWarningRule = require('./address-warning-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('AddressWarningRule', () => {
  const rule = new AddressWarningRule();

  const model = new Model({
    type: 'Place',
    fields: {
      address: {
        fieldName: 'address',
        model: '#PostalAddress',
        alternativeTypes: [
          'https://schema.org/Text',
        ],
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  it('should target Place address fields', () => {
    let isTargeted = rule.isFieldTargeted(model, 'address');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'name');
    expect(isTargeted).toBe(false);
  });

  // No error
  it('should return no error when address is a PostalAddress object', async () => {
    const data = {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1, Test Road',
      },
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
  it('should return no error when address is not set', async () => {
    const data = {
      '@type': 'Place',
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

  // Error
  it('should return an error when address is a string', async () => {
    const data = {
      '@type': 'Event',
      address: '1, Test Road',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.TYPE_LIMITS_USE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });
});
