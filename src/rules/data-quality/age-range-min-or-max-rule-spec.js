const AgeRangeMinOrMaxRule = require('./age-range-min-or-max-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('AgeRangeMinOrMaxRule', () => {
  const rule = new AgeRangeMinOrMaxRule();

  const model = new Model({
    type: 'Event',
    fields: {
      ageRange: {
        fieldName: 'ageRange',
        model: '#QuantitativeValue',
      },
    },
  });

  it('should target ageRange in Event models', () => {
    const isTargeted = rule.isFieldTargeted(model, 'ageRange');
    expect(isTargeted).toBe(true);
  });

  it('should return no error when a minValue is specified', () => {
    const data = {
      type: 'Event',
      ageRange: {
        type: 'QuantitativeValue',
        minValue: 1,
      },
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
  it('should return no error when a maxValue is specified', () => {
    const data = {
      type: 'Event',
      ageRange: {
        type: 'QuantitativeValue',
        maxValue: 1,
      },
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
  it('should return an error when no minValue or maxValue is set', () => {
    const data = {
      type: 'Event',
      ageRange: {
        type: 'QuantitativeValue',
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
});
