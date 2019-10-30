const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const ValidationMode = require('../../helpers/validation-mode');

module.exports = class EventRemainingAttendeeCapacityRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Event: ['remainigAttendeeCapacity'] };
    this.targetValidationModes = [
      ValidationMode.C1Request,
      ValidationMode.C1Response,
      ValidationMode.C2Request,
      ValidationMode.C2Response,
      ValidationMode.BRequest,
      ValidationMode.BResponse,
    ];
    this.meta = {
      name: 'EventRemainingAttendeeCapacityRule',
      description: 'Validates that the remainigAttendeeCapacity of an Event is greater than or equal to 0',
      tests: {
        default: {
          description: 'Raises a failure if the remainingAttendeeCapacity of an Event is not greater than or equal to 0',
          message: 'The `remainingAttendeeCapacity` of an `Event` must be greater than or equal to 0.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
      },
    };
  }

  validateField(node, field) {
    const errors = [];

    const fieldValue = node.getValue(field);

    if (fieldValue < 0) {
      errors.push(
        this.createError(
          'default',
          {
            path: node.getPath(field),
          },
        ),
      );
    }

    return errors;
  }
};