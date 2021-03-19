const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RepeatCountIsPositiveInteger extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Schedule: 'repeatCount', PartialSchedule: 'repeatCount' };
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

  validateField(node, field) {
    const fieldObj = node.model.getField(field);
    const fieldValue = node.getValue(field);

    if (typeof fieldValue !== 'number') {
      return [];
    }

    const errors = [];

    if (typeof fieldObj.minValueInclusive !== 'undefined'
      && (fieldValue < fieldObj.minValueInclusive || fieldValue % 1 !== 0)) {
      errors.push(
        this.createError(
          'default',
          {
            fieldValue,
            path: node.getPath(field),
          },
        ),
      );
    }

    return errors;
  }
};
