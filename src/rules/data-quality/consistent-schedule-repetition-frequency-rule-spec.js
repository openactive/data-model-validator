const ConsistentScheduleRepetitionFrequencyRule = require('./consistent-schedule-repetition-frequency-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');


/*
Ensures that the value given in repeatFrequency is matched by an appropriate byDay, byWeek, or byMonth attribute. Possible values for repeatFrequency are in the first instance P[\d]D, P[\d]W, P[\d]M. In the first instance the repeatFrequency should be paired with a byDay attribute, in the second, byWeek, etc. Note that this test checks for the bare presence of appropriate attributes; there is no semantic checking
*/

describe('ConsistentScheduleRepetitionFrequencyRule', () => {
  const rule = new ConsistentScheduleRepetitionFrequencyRule();

  const model = new Model({
    type: 'Schedule',
    fields: {
      repeatFrequency: {
        fieldName: 'repeatFrequency',
        requiredType: 'https://schema.org/Text',
      },
      byDay: {
        fieldName: 'byDay',
        requiredType: 'ArrayOf#https://schema.org/DayOfWeek',
      },
      byMonth: {
        fieldName: 'byMonth',
        requiredType: 'ArrayOf#https://schema.org/Integer',
      },
      byMonthDay: {
        fieldName: 'byMonthDay',
        requiredType: 'ArrayOf#https://schema.org/Integer',
      },
    },
  }, 'latest');

  it('should target Schedule models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return an error when a repeatFrequency is malformed', async () => {
    const data = {
      type: 'Schedule',
      repeatFrequency: 'P1Day',
    };
    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
  });
  it('should return no error when a repeatFrequency is daily and no further specification is given', async () => {
    const data = {
      type: 'Schedule',
      repeatFrequency: 'P1D',
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
  it('should return no error when a weekly repeatFrequency has a byDay attribute', async () => {
    const data = {
      type: 'Schedule',
      repeatFrequency: 'P1W',
      startDate: '2020-11-03T13:00:00',
      byDay: ['Monday', 'Thursday'],
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
  it('should return no error when a monthly repeatFrequency has a byMonthDay attribute', async () => {
    const data = {
      type: 'Schedule',
      repeatFrequency: 'P1M',
      byMonthDay: [1, 14],
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
  it('should return an error when a daily repeatFrequency has a byMonth attribute', async () => {
    const data = {
      type: 'Schedule',
      repeatFrequency: 'P1D',
      byMonth: [1, 3, 5, 7, 9, 11],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
  });

  it('should return an error when a weekly repeatFrequency has a byMonthDay attribute', async () => {
    const data = {
      type: 'Schedule',
      repeatFrequency: 'P1W',
      startDate: '2020-11-03T13:00:00',
      byMonthDay: [1, 3],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
  });
  it('should return an error when more than one repetition frequency period attribute is specified', async () => {
    const data = {
      type: 'Schedule',
      repeatFrequency: 'P1W',
      byMonth: [1, 3, 5, 7, 9, 11],
      byDay: ['Monday', 'Thursday'],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.REPEATFREQUENCY_MISALIGNED);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
});
