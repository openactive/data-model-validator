const MinValueInclusiveRule = require('./minvalueinclusive-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('MinValueInclusiveRule', () => {
  const rule = new MinValueInclusiveRule();

  const model = new Model({
    type: 'Schedule',
    fields: {
      repeatCount: {
        fieldName: 'repeatCount',
        minValueInclusive: 4,
        requiredType: 'https://schema.org/Integer',
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  it('should target any field', () => {
    const isTargeted = rule.isFieldTargeted(model, 'repeatCount');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors for a value greater than minValueInclusive constraint', async () => {
    const values = [
      89.12345,
      89,
    ];

    for (const value of values) {
      const data = {
        repeatCount: value,
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

  it('should return no error for a value that matches minValueInclusive constraint', async () => {
    const data = { repeatCount: 4 };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });

  it('should return an error for a value below a minValueInclusive constraint', async () => {
    const values = [
      1,
      -100.1,
      -100,
    ];

    for (const value of values) {
      const data = {
        repeatCount: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.BELOW_MIN_VALUE_INCLUSIVE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
