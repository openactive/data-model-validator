const ValidRecurrenceRule = require('./schedule-contains-recurrence-data-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ValidRecurrenceRule', () => {
  const rule = new ValidRecurrenceRule();
  const model = new Model({
    type: 'Schedule',
    fields: {
      repeatFrequency: {
        fieldname: 'repeatFrequency',
        requiredType: 'https://schema.org/Duration',
      },
    },
  }, 'latest');

  it('should target Schedule models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return errors when there are insufficent properties to build a valid recurrence rule', async () => {
    const data = {
      '@type': 'Schedule',
      startTime: '08:30',
      endTime: '09:30',
      scheduleTimezone: 'Europe/London',
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
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should not return errors when there are sufficent properties to build a valid recurrence rule', async () => {
    const data = {
      '@type': 'Schedule',
      startTime: '08:30',
      endTime: '09:30',
      repeatFrequency: 'P1W',
      scheduleTimezone: 'Europe/London',
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
});
