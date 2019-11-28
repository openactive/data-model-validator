const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValueInOptionsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'ValueInOptionsRule',
      description: 'Validates that properties contain allowed values.',
      tests: {
        default: {
          message: 'Value `"{{value}}"` is not in the allowed values for this property. Must be one of:\n\n{{allowedValues}}.',
          sampleValues: {
            value: 'Male',
            allowedValues: '<ul><li>`"https://openactive.io/Female"`</li><li>`"https://openactive.io/Male"`</li><li>`"https://openactive.io/None"`</li></ul>',
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

    if (
      typeof fieldValue !== 'undefined'
      && typeof fieldObj !== 'undefined'
    ) {
      let isInOptions = true;
      let allowedOptions;
      let testType;
      const possibleTypes = fieldObj.getAllPossibleTypes();
      if (possibleTypes.length === 1) {
        testType = possibleTypes[0].replace(/^ArrayOf#/, '');
      } else {
        testType = fieldObj.detectType(fieldValue).replace(/^ArrayOf#/, '');
      }
      if (
        typeof fieldObj.options !== 'undefined'
      ) {
        allowedOptions = fieldObj.options;
      } else if (
        typeof testType !== 'undefined'
        && PropertyHelper.isEnum(testType, node.options.version)
      ) {
        allowedOptions = PropertyHelper.getEnumOptions(testType, node.options.version);
      }

      let singleFieldValue = fieldValue;
      if (typeof allowedOptions !== 'undefined') {
        if (fieldValue instanceof Array && fieldObj.canBeArray()) {
          for (const value of fieldValue) {
            if (allowedOptions.indexOf(value) < 0) {
              isInOptions = false;
              singleFieldValue = value;
              break;
            }
          }
        } else if (allowedOptions.indexOf(fieldValue) < 0) {
          isInOptions = false;
        }
      }

      if (!isInOptions) {
        errors.push(
          this.createError(
            'default',
            {
              value: singleFieldValue,
              path: node.getPath(field),
            },
            {
              value: singleFieldValue,
              allowedValues: `<ul><li>\`"${allowedOptions.join('"`</li><li>`"')}"\`</li></ul>`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
