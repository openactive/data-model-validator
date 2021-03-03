const ScheduledSessionDatetimeFormatRule = require('./scheduled-session-datetime-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ScheduledSessionDatetimeFormatRule', () => {
  let model;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'ScheduledSession',
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
    rule = new ScheduledSessionDatetimeFormatRule();
  });

  it('should target ScheduledSession startDate', () => {
    const isTargetedStartDate = rule.isFieldTargeted(model, 'startDate');
    expect(isTargetedStartDate).toBe(true);
    const isTargetedEndDate = rule.isFieldTargeted(model, 'endDate');
    expect(isTargetedEndDate).toBe(true);
  });

  it('should not return an error for a valid datetime', async () => {
    model.hasSpecification = true;
    const values = [
      '2017-09-06T09:00:00Z',
      '2018-08-01T10:51:02+01:00',
    ];

    for (const value of values) {
      const data = {
        'schema:startDate': value,
        'schema:endDate': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });

  it('should return an error for an invalid datetime', async () => {
    model.hasSpecification = true;
    const values = [
      '2017-09-06T09:00:00',
      '2018-10-17',
      'ABC',
    ];

    for (const value of values) {
      const data = {
        'schema:startDate': value,
        'schema:endDate': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(2);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
      expect(errors[1].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[1].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
