const ValueIsRequiredContentRule = require('./value-is-required-content-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ValueIsRequiredContentRule', () => {
  const model = new Model({
    type: 'Event',
    fields: {
      eventStatus: {
        fieldName: 'eventStatus',
        requiredType: 'http://schema.org/url',
        requiredContent: 'http://schema.org/EventScheduled',
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  const rule = new ValueIsRequiredContentRule();

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the field value matches required content', () => {
    const data = {
      type: 'Event',
      'schema:eventStatus': 'http://schema.org/EventScheduled',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a failure if the field value does not match required content', () => {
    const data = {
      type: 'Event',
      eventStatus: 'http://schema.org/EventInvalid',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
});
