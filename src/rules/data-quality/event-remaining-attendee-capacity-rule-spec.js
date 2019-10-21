const EventRemainingAttendeeCapacityRule = require('./event-remaining-attendee-capacity-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const OptionsHelper = require('../../helpers/options');

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

  for (const mode of ['C1', 'C2', 'B']) {
    it(`should target booking mode ${mode}`, () => {
      const isTargeted = rule.isModeTargeted(mode);
      expect(isTargeted).toBe(true);
    });
  }

  it('should not target opendata mode', () => {
    const isTargeted = rule.isModeTargeted('opendata');
    expect(isTargeted).toBe(false);
  });

  describe('when in a booking mode like C1', () => {
    const options = new OptionsHelper({ mode: 'C1' });

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
        options,
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
        options,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    });
  });
});
