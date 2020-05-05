const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ShallNotIncludeFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'ShallNotIncludeFieldsRule',
      description: 'Validates that fields that there are no fields that should not be included',
      tests: {
        default: {
          message: 'The property `{{field}}` must not be present in `{{model}}` in this validation mode.',
          sampleValues: {
            field: 'name',
            model: 'Event',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC,
        },
      },
    };
  }

  validateField(node, field) {
    const errors = [];

    const shallNots = node.model.getShallNotIncludeFields(node.options.validationMode, node.name);
    if (typeof shallNots !== 'undefined') {
      if (PropertyHelper.arrayHasField(shallNots, field, node.model.version)) {
        errors.push(
          this.createError(
            'default',
            {
              value: node.getValue(field),
              path: node.getPath(field),
            },
            {
              field: PropertyHelper.convertFieldNameToJsonLd(field),
              model: node.model.type,
            },
          ),
        );
      }
    }

    return errors;
  }
};
