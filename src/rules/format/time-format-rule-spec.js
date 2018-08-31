const TimeFormatRule = require('./time-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('TimeFormatRule', () => {
  const rule = new TimeFormatRule();

  it('should target fields of any type', () => {
    const model = new Model({
      type: 'Event',
    }, 'latest');
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  // ISO8601Time
  it('should return no error for an valid time', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        time: {
          fieldName: 'time',
          requiredType: 'https://schema.org/Time',
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      '09:00',
      '09:00:00',
      '09:00:00Z',
      '09:00:00+01:00',
    ];

    for (const value of values) {
      const data = {
        time: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid time', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        time: {
          fieldName: 'time',
          requiredType: 'https://schema.org/Time',
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      '2017-09-06T09:00:00',
      '2018-10-17',
      '25:00:00Z',
      'ABC',
    ];

    for (const value of values) {
      const data = {
        time: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid time with a namespace', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        startTime: {
          fieldName: 'startTime',
          requiredType: 'https://schema.org/Time',
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      '2017-09-06T09:00:00',
      '2018-10-17',
      '25:00:00Z',
      'ABC',
    ];

    for (const value of values) {
      const data = {
        'schema:startTime': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid time from an unknown Model', () => {
    const model = new Model({}, 'latest');

    const values = [
      '25:00:00Z',
    ];

    for (const value of values) {
      const data = {
        time: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
