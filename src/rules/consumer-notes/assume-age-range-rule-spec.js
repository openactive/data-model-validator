const AssumeAgeRangeRule = require('./assume-age-range-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('AssumeAgeRangeRule', () => {
  const rule = new AssumeAgeRangeRule();

  const model = new Model({
    type: 'Event',
    fields: {
      ageRange: {
        fieldName: 'ageRange',
        model: '#QuantitativeValue',
      },
    },
  });
  model.hasSpecification = true;

  it('should target Event models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no notice when a complete ageRange is specified', () => {
    const data = {
      type: 'Event',
      ageRange: {
        type: 'QuantitativeValue',
        minValue: 18,
        maxValue: 25,
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

  it('should return a notice when no ageRange is specified', () => {
    const data = {
      type: 'Event',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.NOTICE);
  });
  it('should return a notice when a minValue is specified', () => {
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
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.NOTICE);
  });
  it('should return a notice when a maxValue is specified', () => {
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
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.NOTICE);
  });
  it('should return a notice when a minValue of 0 and no maxValue is set', () => {
    const data = {
      type: 'Event',
      ageRange: {
        type: 'QuantitativeValue',
        minValue: 0,
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
    expect(errors[0].type).toBe(ValidationErrorType.CONSUMER_ASSUME_AGE_RANGE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.NOTICE);
  });
});