const ValueConstraintRule = require('./valueconstraint-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ValueConstraintRule', () => {
  const rule = new ValueConstraintRule();

  const model = new Model({
    type: 'Schedule',
    fields: {
      uuid: {
        fieldName: 'uuid',
        valueConstraint: 'UUID',
      },
      uritemplate: {
        fieldName: 'uritemplate',
        valueConstraint: 'UriTemplate',
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  it('should target any field', () => {
    const isTargeted = rule.isFieldTargeted(model, 'repeatCount');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors for a value that is a valid UUID', async () => {
    const values = [
      '123e4567-e89b-12d3-a456-426614174000',
      '00000000-0000-0000-0000-000000000000',
    ];

    for (const value of values) {
      const data = {
        uuid: value,
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

  it('should return an error when the value is not a valid UUID', async () => {
    const values = [
      '123E4567-E89B-12D3-A456-426614174000',
      '000000000000000000000000000000000000',
      '123e4567-e89b-12d3-a456-4266141740000',
      '123e4567-e89b-12d3-a456-42661417400',
      0,
      1.1,
    ];

    for (const value of values) {
      const data = {
        uuid: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.VALUE_OUTWITH_CONSTRAINT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return no errors for a value that is a valid URI Template', async () => {
    const values = [
      'https://api.example.org/session-series/123/{startDate}',
    ];

    for (const value of values) {
      const data = {
        uritemplate: value,
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

  it('should return an error when the value is not a valid URI Template', async () => {
    const values = [
      'https://api.example.org/session-series/123/',
    ];

    for (const value of values) {
      const data = {
        uritemplate: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.VALUE_OUTWITH_CONSTRAINT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
