const IdRule = require('./id-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('IdRule', () => {
  const rule = new IdRule();

  const model = new Model({
    type: 'Event',
    fields: {
    },
  }, 'latest');
  model.hasSpecification = true;

  it('should target id field', () => {
    const isTargeted = rule.isFieldTargeted(model, '@id');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors for a value that is a valid URL', async () => {
    const values = [
      'https://www.google.com/',
    ];

    for (const value of values) {
      const data = {
        '@id': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });

  it('should return an error for a value that is not a valid URL', async () => {
    const values = [
      '123E4567-E89B-12D3-A456-426614174000',
      0,
      '0',
    ];

    for (const value of values) {
      const data = {
        '@id': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_ID);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
