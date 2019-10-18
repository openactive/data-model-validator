const EventRemainingAttendeeCapacityRule = require('./event-remaining-attendee-capacity-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('EventRemainingAttendeeCapacityRule', () => {
  const rule = new EventRemainingAttendeeCapacityRule();

  const model = new Model({
    type: 'Event',
    fields: {
      remainigAttendeeCapacity: {
        fieldName: 'remainingAttendeeCapacity',
        requiredType: 'https://schema.org/Integer',
      },
    },
  }, 'latest');

  it('should target remainigAttendeeCapacity fields', () => {
    const isTargeted = rule.isFieldTargeted(model, 'remainigAttendeeCapacity');
    expect(isTargeted).toBe(true);
  });

  it('should return no error when remainingAttendeeCapacity is > 0', () => {
    const data = {
      type: 'Event',
      remainigAttendeeCapacity: 1,
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

  it('should return no error when remainingAttendeeCapacity is < 0', () => {
    const data = {
      type: 'Event',
      remainigAttendeeCapacity: -1,
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
