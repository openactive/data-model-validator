const NoZeroDurationRule = require('./no-zero-duration-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('NoZeroDurationRule', () => {
  const rule = new NoZeroDurationRule();

  const model = new Model({
    type: 'Event',
    fields: {
      duration: {
        fieldName: 'duration',
        requiredType: 'http://schema.org/Duration',
      },
    },
  }, 'latest');

  it('should target Event models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no error when a non-zero duration is supplied', () => {
    const data = {
      type: 'Event',
      duration: 'PT1H',
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

  it('should return an error when a zero duration is supplied', () => {
    const data = {
      type: 'Event',
      duration: 'PT0S',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.NO_ZERO_DURATION);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });

  it('should return an error when a zero duration is supplied with a namespace', () => {
    const data = {
      type: 'Event',
      'schema:duration': 'PT0S',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.NO_ZERO_DURATION);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
});
