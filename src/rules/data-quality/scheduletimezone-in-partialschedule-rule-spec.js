const TimezoneInPartialSchedule = require('./scheduletimezone-in-partialschedule-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('TimezoneInPartialSchedule', () => {
  const rule = new TimezoneInPartialSchedule();
  const model = new Model({
    type: 'PartialSchedule',
    fields: {
      startTime: {
        fieldName: 'startTime',
        requiredType: 'https://schema.org/Time',
      },
      endTime: {
        fieldName: 'endTime',
        requiredType: 'https://schema.org/Time',
      },
      scheduleTimezone: {
        fieldName: 'scheduleTimezone',
        requiredType: 'https://schema.org/Text',
      },
    },
  }, 'latest');

  it('should target PartialSchedule models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should not return errors when startTime, endTime, and scheduleTimezone are present', async () => {
    const data = {
      '@type': 'PartialSchedule',
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

    expect(errors.length).toBe(0);
  });

  it('should return errors when startTime and endTime are present, but scheduleTimezone is not', async () => {
    const data = {
      '@type': 'PartialSchedule',
      startTime: '08:30',
      endTime: '09:30',
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
});
