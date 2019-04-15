const MaxLessThenMinRule = require('./max-less-than-min-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('MaxLessThenMinRule', () => {
  const rule = new MaxLessThenMinRule();

  const model = new Model({
    type: 'QuantitativeValue',
    fields: {
      minValue: {
        fieldName: 'minValue',
        requiredType: 'https://schema.org/Integer',
      },
      maxValue: {
        fieldName: 'maxValue',
        requiredType: 'https://schema.org/Integer',
      },
    },
  }, 'latest');

  it('should target QuantitativeValue models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no error when the minValue is lower than the maxValue', async () => {
    const data = {
      type: 'QuantitativeValue',
      minValue: 1,
      maxValue: 10,
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
  it('should return no error when the minValue is lower than the maxValue in a namespaced field', async () => {
    const data = {
      type: 'QuantitativeValue',
      'schema:minValue': 1,
      'schema:maxValue': 10,
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
  it('should return no error when the minValue is equal to the maxValue', async () => {
    const data = {
      type: 'QuantitativeValue',
      minValue: 10,
      maxValue: 10,
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
  it('should return no error when the minValue is set, but the maxValue isn\'t', async () => {
    const data = {
      type: 'QuantitativeValue',
      minValue: 1,
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
  it('should return an error when the minValue is greater than the maxValue', async () => {
    const data = {
      type: 'QuantitativeValue',
      minValue: 10,
      maxValue: 1,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validateAsync(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.MIN_VALUE_GREATER_THAN_MAX_VALUE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });
});
