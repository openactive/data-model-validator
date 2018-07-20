const moment = require('moment');
const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoZeroDurationRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'Schedule'];
    this.description = 'Validates that a duration is non-zero in an Event or Schedule.';
  }

  validateModel(node) {
    if (typeof (node.value.duration) === 'undefined') {
      return [];
    }
    const errors = [];

    if (moment.duration(node.value.duration).valueOf() === 0) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.NO_ZERO_DURATION,
            value: undefined,
            severity: ValidationErrorSeverity.FAILURE,
            path: `${node.getPath()}.duration`,
          },
        ),
      );
    }

    return errors;
  }
};
