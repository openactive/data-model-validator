const EndBeforeStartRule = require('./end-before-start-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('EndBeforeStartRule', () => {
  const rule = new EndBeforeStartRule();

  const model = new Model({
    type: 'Event',
    fields: {
      startDate: {
        fieldName: 'startDate',
        requiredType: 'https://schema.org/DateTime',
      },
      endDate: {
        fieldName: 'endDate',
        requiredType: 'https://schema.org/DateTime',
      },
    },
  }, 'latest');

  it('should target Event models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no error when the startDate is before the endDate', async () => {
    const data = {
      type: 'Event',
      startDate: '2017-09-06T09:00:00Z',
      endDate: '2018-01-15T09:00:00+01:00',
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
  it('should return no error when the startDate is before the endDate in a namespaced field', async () => {
    const data = {
      type: 'Event',
      'schema:startDate': '2017-09-06T09:00:00Z',
      'schema:endDate': '2018-01-15T09:00:00+01:00',
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
  it('should return no error when the startDate is set, but the endDate isn\'t', async () => {
    const data = {
      type: 'Event',
      startDate: '2017-09-06T09:00:00Z',
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
  it('should return an error when the startDate is after the endDate', async () => {
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
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.START_DATE_AFTER_END_DATE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
});
