const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoEmptyValuesRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'NoEmptyValuesRule',
      description: 'Validates that properties are not null, an empty string or an empty array.',
      tests: {
        notNull: {
          description: 'Validates that a property is not null.',
          message: 'Properties must be omitted when they contain null values. This can be achieved with Null Value Handling serialisation settings in many JSON libraries, for example [Json.NET](https://www.newtonsoft.com/json/help/html/T_Newtonsoft_Json_NullValueHandling.htm).',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_IS_EMPTY,
        },
        notEmptyString: {
          description: 'Validates that a property is not an empty string.',
          message: 'Properties must be omitted when they contain empty strings.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_IS_EMPTY,
        },
        notEmptyArray: {
          description: 'Validates that a property is not an empty array.',
          message: 'Properties must be omitted when they contain empty arrays.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_IS_EMPTY,
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
    const fieldValue = node.getValue(field);
    if (typeof fieldValue !== 'undefined') {
      let testKey;
      if (fieldValue === null) {
        testKey = 'notNull';
      } else if (fieldValue instanceof Array && fieldValue.length === 0) {
        testKey = 'notEmptyArray';
      } else if (fieldValue === '') {
        testKey = 'notEmptyString';
      }
      if (testKey) {
        errors.push(
          this.createError(
            testKey,
            {
              value: fieldValue,
              path: node.getPath(field),
            },
          ),
        );
      }
    }
    return errors;
  }
};
