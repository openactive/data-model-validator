const RruleFormatRule = require('./rrule-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('RruleFormatRule', () => {
  const rule = new RruleFormatRule();

  it('should target the byDay field of the Schedule type', () => {
    const model = new Model({
      type: 'Schedule',
    }, 'latest');
    const isTargeted = rule.isFieldTargeted(model, 'byDay');
    expect(isTargeted).toBe(true);
  });

  // RFC 5545
  it('should return no error for an valid byDay rrule', async () => {
    const model = new Model({
      type: 'Schedule',
      fields: {
        byDay: {
          fieldName: 'byDay',
          requiredType: 'ArrayOf#https://schema.org/DayOfWeek',
          alternativeTypes: ['ArrayOf#https://schema.org/Text'],
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      'MO',
      '2MO',
      '-1FR',
    ];

    for (const value of values) {
      const data = {
        byDay: [value, 'https://schema.org/Monday'],
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
  it('should return an error for an invalid byDay iCal value', async () => {
    const model = new Model({
      type: 'Schedule',
      fields: {
        byDay: {
          fieldName: 'byDay',
          requiredType: 'ArrayOf#https://schema.org/DayOfWeek',
          alternativeTypes: ['ArrayOf#https://schema.org/Text'],
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      'TR',
      'MOTU',
      '2MO,2TY',
      '2MO,-2FR',
      'MO,TH',
    ];

    for (const value of values) {
      const data = {
        byDay: [value, 'https://schema.org/Monday'],
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid byDay schema.org value', async () => {
    const model = new Model({
      type: 'Schedule',
      fields: {
        byDay: {
          fieldName: 'byDay',
          requiredType: 'ArrayOf#https://schema.org/DayOfWeek',
          alternativeTypes: ['ArrayOf#https://schema.org/Text'],
        },
      },
    }, 'latest');
    model.hasSpecification = true;
    const values = [
      'http://schema.org/Monday',
      'http://schema.org/NotADay',
      'Monday',
    ];

    for (const value of values) {
      const data = {
        byDay: [value, '2MO'],
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
