const RepeatCountIsPositiveInteger = require('./repeatcount-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('RepeatCountIsPositiveInteger', () => {
  const rule = new RepeatCountIsPositiveInteger();

  const model = new Model({
    type: 'Schedule',
    fields: {
      repeatCount: {
        fieldName: 'repeatCount',
        minValueInclusive: 1,
        requiredType: 'https://schema.org/Integer',
      },
    },
  }, 'latest');

  it('should target Schedule model', () => {
    const isTargeted = rule.isFieldTargeted(model, 'repeatCount');
    expect(isTargeted).toBe(true);
  });

  it('should not return an error when repeatCount is a positive integer', async () => {
    const data = {
      '@type': 'Schedule',
      repeatCount: 10,
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

  it('should return an error when repeatCount is a negative number', async () => {
    const data = {
      '@type': 'Schedule',
      repeatCount: -10,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.UNSUPPORTED_VALUE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return an error when repeatCount is not an integer', async () => {
    const data = {
      '@type': 'Schedule',
      repeatCount: 10.10,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.UNSUPPORTED_VALUE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
