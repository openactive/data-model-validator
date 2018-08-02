const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValueIsRequiredContentRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'ValueIsRequiredContentRule',
      description: 'Validates that fields match defined required content.',
      tests: {
        default: {
          message: 'Value "{{value}}" is not an allowed value for this field. Should be "{{allowedValue}}".',
          sampleValues: {
            value: 'Event',
            allowedValue: 'Session',
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

    if (typeof fieldObj !== 'undefined') {
      const fieldValue = node.getMappedValue(field);
      if (typeof fieldValue !== 'undefined'
        && fieldObj.fieldName !== 'type'
        && typeof fieldObj.requiredContent !== 'undefined'
        && fieldObj.requiredContent !== fieldValue
      ) {
        errors.push(
          this.createError(
            'default',
            {
              value: fieldValue,
              path: node.getPath(field),
            },
            {
              value: fieldValue,
              allowedValue: fieldObj.requiredContent,
            },
          ),
        );
      }
    }
    return errors;
  }
};
