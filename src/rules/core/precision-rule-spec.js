const PrecisionRule = require('./precision-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('PrecisionRule', () => {
  const rule = new PrecisionRule();

  const model = new Model({
    type: 'Precision',
    fields: {
      price: {
        fieldName: 'price',
        maxDecimalPlaces: 2,
        sameAs: 'https://schema.org/price',
        requiredType: 'https://schema.org/Number',
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  it('should target any field', () => {
    const isTargeted = rule.isFieldTargeted(model, 'price');
    expect(isTargeted).toBe(true);
  });

  it('should return no error for a value with the correct number of decimal places', async () => {
    const values = [
      -89.12,
      0.01,
      70.44,
    ];

    for (const value of values) {
      const data = {
        price: value,
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

  it('should return an error for a value above a maxDecimalPlaces threshold', async () => {
    const values = [
      90.995,
      100.0001,
    ];

    for (const value of values) {
      const data = {
        price: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_PRECISION);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
