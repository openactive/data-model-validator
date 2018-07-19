

const DateFormatRule = require('./date-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('DateFormatRule', () => {
  const rule = new DateFormatRule();

  it('should target fields of any type', () => {
    const model = new Model({
      type: 'Event',
    });
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  // ISO8601Date
  it('should return no error for an valid date', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        date: {
          fieldName: 'date',
          requiredType: 'http://schema.org/Date',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      '2017-09-06',
      '20180115',
    ];

    for (const value of values) {
      const data = {
        date: value,
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
  it('should return an error for an invalid date', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        date: {
          fieldName: 'date',
          requiredType: 'http://schema.org/Date',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      '2017-12-06T09:00:00',
      '2018-13-17',
      'ABC',
      '2017-02-29', // Not a leap year
    ];

    for (const value of values) {
      const data = {
        date: value,
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
  it('should return an error for an invalid date from an unknown Model', () => {
    const model = new Model({});

    const values = [
      '2018-13-17',
      '2017-02-29', // Not a leap year
    ];

    for (const value of values) {
      const data = {
        date: value,
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
