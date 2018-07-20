const ValueInOptionsRule = require('./value-in-options-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ValueInOptionsRule', () => {
  const model = new Model({
    type: 'Event',
    fields: {
      eventStatus: {
        fieldName: 'eventStatus',
        requiredType: 'http://schema.org/url',
        options: [
          'http://schema.org/EventCancelled',
          'http://schema.org/EventPostponed',
          'http://schema.org/EventRescheduled',
          'http://schema.org/EventScheduled',
        ],
      },
    },
  });
  model.hasSpecification = true;

  const rule = new ValueInOptionsRule();

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the field value is in the options array', () => {
    const data = {
      type: 'Event',
      eventStatus: 'http://schema.org/EventScheduled',
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

  it('should return a failure if the field value is not in the options array', () => {
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
