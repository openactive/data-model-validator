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
      latitude: {
        fieldName: 'latitude',
        minDecimalPlaces: 3,
        sameAs: 'http://schema.org/latitude',
        requiredType: 'http://schema.org/Float',
      },
      price: {
        fieldName: 'price',
        maxDecimalPlaces: 2,
        sameAs: 'http://schema.org/price',
        requiredType: 'http://schema.org/Float',
      },
    },
  });
  model.hasSpecification = true;

  it('should target any field', () => {
    const isTargeted = rule.isFieldTargeted(model, 'latitude');
    expect(isTargeted).toBe(true);
  });

  it('should return no error for a value above a minDecimalPlaces threshold', () => {
    const values = [
      -89.123456,
      5.01123,
      70.445234,
    ];

    for (const value of values) {
      const data = {
        latitude: value,
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
  it('should return an error for a value below a minDecimalPlaces threshold', () => {
    const values = [
      90.120,
      -100.1,
      110,
    ];

    for (const value of values) {
      const data = {
        latitude: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_PRECISION);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.SUGGESTION);
    }
  });

  it('should return no error for a value below a maxDecimalPlaces threshold', () => {
    const values = [
      10,
      10.50,
      9.99,
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
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for a value above a maxDecimalPlaces threshold', () => {
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
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_PRECISION);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
