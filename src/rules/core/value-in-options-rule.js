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
            allowedValues: '"http://openactive.io/ns#Female", "http://openactive.io/ns#Male", "http://openactive.io/ns#None"',
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

    if (typeof node.value[field] !== 'undefined'
      && typeof fieldObj !== 'undefined'
      && typeof fieldObj.options !== 'undefined'
    ) {
      let isInOptions = true;
      if (node.value[field] instanceof Array && fieldObj.canBeArray()) {
        for (const value of node.value[field]) {
          if (fieldObj.options.indexOf(value) < 0) {
            isInOptions = false;
            break;
          }
        }
      } else if (fieldObj.options.indexOf(node.value[field]) < 0) {
        isInOptions = false;
      }

      if (!isInOptions) {
        errors.push(
          this.createError(
            'default',
            {
              value: node.value[field],
              path: `${node.getPath()}.${field}`,
            },
            {
              value: node.value[field],
              allowedValues: this.safeString(`"${fieldObj.options.join('", "')}"`),
            },
          ),
        );
      }
    }
    return errors;
  }
};
