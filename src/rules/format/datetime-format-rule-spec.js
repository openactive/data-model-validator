const DatetimeFormatRule = require('./datetime-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('DatetimeFormatRule', () => {
  const rule = new DatetimeFormatRule();

  it('should target fields of any type', () => {
    const model = new Model({
      type: 'Event',
    }, 'latest');
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  // ISO8601DateTime
  it('should return no error for an valid datetime', async () => {
    const model = new Model({
      type: 'Event',
      fields: {
        datetime: {
          fieldName: 'datetime',
          requiredType: 'https://schema.org/DateTime',
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      '2017-09-06T09:00:00Z',
      '2018-01-15T09:00:00+01:00',
    ];

    for (const value of values) {
      const data = {
        datetime: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid datetime', async () => {
    const model = new Model({
      type: 'Event',
      fields: {
        datetime: {
          fieldName: 'datetime',
          requiredType: 'https://schema.org/DateTime',
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      '2017-09-06T09:00:00',
      '2018-10-17',
      'ABC',
    ];

    for (const value of values) {
      const data = {
        datetime: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid datetime with a namespace', async () => {
    const model = new Model({
      type: 'Event',
      fields: {
        startDate: {
          fieldName: 'startDate',
          requiredType: 'https://schema.org/DateTime',
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      '2017-09-06T09:00:00',
      '2018-10-17',
      'ABC',
    ];

    for (const value of values) {
      const data = {
        'schema:startDate': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid datetime from an unknown Model', async () => {
    const model = new Model({}, 'latest');

    const values = [
      '2017-09-06T09:00:00',
    ];

    for (const value of values) {
      const data = {
        datetime: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
