const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RepeatCountIsPositiveInteger extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Schedule', 'PartialSchedule'];
    this.meta = {
      name: 'RepeatCountIsPositiveInteger',
      description: 'Validates that repeatCount is a positive integer',
      tests: {
        default: {
          message: 'repeatCount must be a positive integer',
          sampleValues: {
            field: 'repeatCount',
            allowedValues: 10,
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.UNSUPPORTED_VALUE,
        },
      },
    };
  }

  validateModel(node) {
    const repeatCount = node.getValue('repeatCount');

    if (typeof repeatCount === 'undefined'
    ) {
      return [];
    }
    const errors = [];

    if (repeatCount < 1
      || repeatCount % 1 !== 0) {
      errors.push(
        this.createError(
          'default',
          {
            repeatCount,
            path: node.getPath('repeatCount'),
          },
        ),
      );
    }

    return errors;
  }
};
