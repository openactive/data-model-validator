const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DatesMustHaveDurationRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'Schedule'];
    this.description = 'Validates that a duration is supplied where both startDate and endDate are given in an Event or Schedule.';
  }

  validateModel(node) {
    if (typeof (node.value.startDate) === 'undefined'
        || typeof (node.value.endDate) === 'undefined'
    ) {
      return [];
    }
    const errors = [];

    if (typeof node.value.duration === 'undefined') {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.DATES_MUST_HAVE_DURATION,
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
