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

  describe('isValidationModeTargeted', () => {
    const modesToTest = ['C1Request', 'C1Response', 'C2Request', 'C2Response', 'BRequest', 'BResponse'];

    for (const mode of modesToTest) {
      it(`should target ${mode}`, () => {
        const isTargeted = rule.isValidationModeTargeted(mode);
        expect(isTargeted).toBe(true);
      });
    }

    it('should not target RPDEFeed validation mode', () => {
      const isTargeted = rule.isValidationModeTargeted('RPDEFeed');
      expect(isTargeted).toBe(false);
    });
  });

  describe('when in a booking mode like C1Request', () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });

    it('should return no error when remainingAttendeeCapacity is > 0', async () => {
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
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    });

    it('should return no error when remainingAttendeeCapacity is < 0', async () => {
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
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    });
  });
});
