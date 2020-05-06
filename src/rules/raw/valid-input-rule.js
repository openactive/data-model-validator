const RawRule = require('../raw-rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValidInputRule extends RawRule {
  constructor(options) {
    super(options);
    this.meta = {
      name: 'ValidInputRule',
      description: 'Validates that the JSON submission is in the correct format for the library.',
      tests: {
        noArray: {
          description: 'Generates a warning if the JSON submission is an array.',
          message: 'Arrays are not supported for validation. Please only submit single objects for validation: either an object conforming to the [Modelling Specification](https://openactive.io/modelling-opportunity-data/), or an [RPDE](https://openactive.io/realtime-paged-data-exchange/) feed root object.',
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.INVALID_JSON,
        },
        noInvalid: {
          description: 'Generates an error if the submission is not a valid JSON object.',
          message: 'Only objects are supported for validation. Please only submit single objects for validation: either an object conforming to the [Modelling Specification](https://openactive.io/modelling-opportunity-data/), or an [RPDE](https://openactive.io/realtime-paged-data-exchange/) feed root object.',
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_JSON,
        },
      },
    };
  }

  validateRaw(data) {
    const errors = [];
    let testKey;
    if (
      typeof data === 'object'
      && data instanceof Array
    ) {
      testKey = 'noArray';
    } else if (
      typeof data !== 'object'
      || data === null
    ) {
      testKey = 'noInvalid';
    }
    if (testKey) {
      errors.push(
        this.createError(
          testKey,
          {
            value: data,
            path: '$',
          },
        ),
      );
    }

    return {
      errors,
    };
  }
};
