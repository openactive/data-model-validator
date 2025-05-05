const ScheduleTimezoneMatchesIANAList = require('./scheduletimezone-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ScheduleTimezoneMatchesIANAList', () => {
  const rule = new ScheduleTimezoneMatchesIANAList();
  const model = new Model({
    type: 'PartialSchedule',
    fields: {
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

  it('should not return errors when scheduleTimezone is in the IANA database list', async () => {
    const data = {
      '@type': 'PartialSchedule',
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

  it('should return errors when scheduleTimezone is not in the IANA database list', async () => {
    const data = {
      '@type': 'PartialSchedule',
      scheduleTimezone: 'Europe/Slough',
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
