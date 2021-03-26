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
        fieldname: 'byDay',
        requiredType: 'https://schema.org/Duration',
      },
      byDay: {
        fieldname: 'byDay',
        requiredType: 'ArrayOf#https://schema.org/DayOfWeek',
        alternativeTypes: ['ArrayOf#https://schema.org/Text'],
      },
      byMonth: {
        fieldname: 'byMonth',
        requiredType: 'https://schema.org/Integer',
      },
      byMonthDay: {
        fieldname: 'byMonthDay',
        requiredType: 'https://schema.org/Integer',
      },
      startDate: {
        fieldname: 'startDate',
        requiredType: 'https://schema.org/Date',
      },
      EndDate: {
        fieldname: 'EndDate',
        requiredType: 'https://schema.org/Date',
      },
      startTime: {
        fieldname: 'startTime',
        requiredType: 'https://schema.org/Time',
      },
      EndTime: {
        fieldname: 'EndTime',
        requiredType: 'https://schema.org/Time',
      },
      count: {
        fieldname: 'count',
        requiredType: 'https://schema.org/Integer',
      },
      scheduleTimezone: {
        fieldName: 'scheduleTimezone',
        requiredType: 'https://schema.org/Text',
      },
    },
  }, 'latest');

  it('should target Schedule models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return errors when startDate is missing', async () => {
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

    expect(errors.length).toBe(2);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return errors when startTime is missing', async () => {
    const data = {
      '@type': 'Schedule',
      startDate: '2021-03-19',
      repeatFrequency: 'P1W',
      count: 10000,
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
      startDate: '2021-03-19',
      startTime: '08:30',
      repeatFrequency: 'P1W',
      count: 1,
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
