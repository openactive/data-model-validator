

const DurationFormatRule = require('./duration-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('DurationFormatRule', () => {
  const rule = new DurationFormatRule();

  it('should target fields of any type', () => {
    const model = new Model({
      type: 'Event',
    });
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  // ISO8601Duration
  it('should return no error for an valid duration', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        duration: {
          fieldName: 'duration',
          requiredType: 'http://schema.org/Duration',
        },
      },
    });
    model.hasSpecification = true;
    const values = [
      'P0Y',
      'PT0,5H',
      'P5DT0.5S',
      'P5YT7H20M',
      'P2W',
    ];

    for (const value of values) {
      const data = {
        duration: value,
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
  it('should return an error for an invalid duration', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        duration: {
          fieldName: 'duration',
          requiredType: 'http://schema.org/Duration',
        },
      },
    });
    model.hasSpecification = true;
    const values = [
      'P',
      'P7H',
      'P0.5Y0.5M',
    ];

    for (const value of values) {
      const data = {
        duration: value,
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
  it('should return an error for an invalid duration with a namespace', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        duration: {
          fieldName: 'duration',
          requiredType: 'http://schema.org/Duration',
        },
      },
    });
    model.hasSpecification = true;
    const values = [
      'P',
      'P7H',
      'P0.5Y0.5M',
    ];

    for (const value of values) {
      const data = {
        'schema:duration': value,
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
  it('should return an error for an invalid duration from an unknown Model', () => {
    const model = new Model({});

    const values = [
      'P7H',
      'P0.5Y0.5M',
    ];

    for (const value of values) {
      const data = {
        duration: value,
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
