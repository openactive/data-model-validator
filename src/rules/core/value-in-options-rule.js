const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValueInOptionsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'ValueInOptionsRule',
      description: 'Validates that fields contain allowed values.',
      tests: {
        default: {
          message: 'Value "{{value}}" is not in the allowed values for this field. Should be one of {{allowedValues}}.',
          sampleValues: {
            value: 'Male',
            allowedValues: '"https://openactive.io/Female", "https://openactive.io/Male", "https://openactive.io/None"',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
      },
    };
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    const fieldObj = node.model.getField(field);
    const fieldValue = node.getValue(field);

    if (typeof fieldValue !== 'undefined'
      && typeof fieldObj !== 'undefined'
      && typeof fieldObj.options !== 'undefined'
    ) {
      let isInOptions = true;
      if (fieldValue instanceof Array && fieldObj.canBeArray()) {
        for (const value of fieldValue) {
          if (fieldObj.options.indexOf(value) < 0) {
            isInOptions = false;
            break;
          }
        }
      } else if (fieldObj.options.indexOf(fieldValue) < 0) {
        isInOptions = false;
      }

      if (!isInOptions) {
        errors.push(
          this.createError(
            'default',
            {
              value: fieldValue,
              path: node.getPath(field),
            },
            {
              value: fieldValue,
              allowedValues: `"${fieldObj.options.join('", "')}"`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
