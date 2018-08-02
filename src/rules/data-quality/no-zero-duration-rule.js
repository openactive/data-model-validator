const moment = require('moment');
const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoZeroDurationRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'Schedule'];
    this.meta = {
      name: 'NoZeroDurationRule',
      description: 'Validates that a duration is non-zero in an Event or Schedule.',
      tests: {
        default: {
          message: 'Zero durations are not allowed.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.NO_ZERO_DURATION,
        },
      },
    };
  }

  validateModel(node) {
    if (!PropertyHelper.objectHasField(node.value, 'duration')) {
      return [];
    }
    const errors = [];
    if (moment.duration(PropertyHelper.getObjectField(node.value, 'duration')).valueOf() === 0) {
      errors.push(
        this.createError(
          'default',
          {
            value: PropertyHelper.getObjectField(node.value, 'duration'),
            path: node.getPath('duration'),
          },
        ),
      );
    }

    return errors;
  }
};
