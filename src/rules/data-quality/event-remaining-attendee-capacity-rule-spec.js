const EventRemainingAttendeeCapacityRule = require('./event-remaining-attendee-capacity-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const OptionsHelper = require('../../helpers/options');
const ValidationMode = require('../../helpers/validation-mode');

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

  for (const mode of [ValidationMode.C1Request, ValidationMode.C1Response, ValidationMode.C2Request, ValidationMode.C2Response, ValidationMode.BRequest, ValidationMode.BResponse]) {
    it(`should target booking validation mode ${mode}`, () => {
      const isTargeted = rule.isValidationModeTargeted(mode);
      expect(isTargeted).toBe(true);
    });
  }

  it('should not target OpenData validation mode', () => {
    const isTargeted = rule.isValidationModeTargeted(ValidationMode.OpenData);
    expect(isTargeted).toBe(false);
  });

  describe('when in a booking mode like C1Request', () => {
    const options = new OptionsHelper({ validationMode: ValidationMode.C1Request });

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
