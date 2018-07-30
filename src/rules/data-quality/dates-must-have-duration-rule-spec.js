const DatesMustHaveDurationRule = require('./dates-must-have-duration-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('DatesMustHaveDurationRule', () => {
  const rule = new DatesMustHaveDurationRule();

  const model = new Model({
    type: 'Event',
    fields: {
      startDate: {
        fieldName: 'startDate',
        requiredType: 'http://schema.org/DateTime',
      },
      endDate: {
        fieldName: 'endDate',
        requiredType: 'http://schema.org/DateTime',
      },
      duration: {
        fieldName: 'endDate',
        requiredType: 'http://schema.org/Duration',
      },
    },
  });

  it('should target Event models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no error when a duration is supplied with a startDate and endDate', () => {
    const data = {
      type: 'Event',
      startDate: '2017-09-06T09:00:00Z',
      endDate: '2017-09-06T10:00:00Z',
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
  it('should return no error when a duration is supplied with a startDate and endDate in namespaced field', () => {
    const data = {
      type: 'Event',
      startDate: '2017-09-06T09:00:00Z',
      endDate: '2017-09-06T10:00:00Z',
      'schema:duration': 'PT1H',
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
  it('should return an error when no duration is supplied with a startDate and endDate', () => {
    const data = {
      type: 'Event',
      startDate: '2017-09-06T09:00:00Z',
      endDate: '2017-01-15T09:00:00Z',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.DATES_MUST_HAVE_DURATION);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
});
