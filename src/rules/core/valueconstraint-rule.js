const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValueConstraintRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'ValueConstraintRule',
      description: 'Validates that all properties meet the associated valueConstraint parameter.',
      tests: {
        valueConstraint: {
          description: 'Raises a failure if the value does not match the associated constraint',
          message: 'The value of this property did not match the expected "{{valueConstraint}}" format.',
          sampleValues: {
            valueConstraint: 'UriTemplate',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.VALUE_OUTWITH_CONSTRAINT,
        },
      },
    };
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    if (!node.model.hasField(field)) {
      return [];
    }

    const errors = [];

    // Get the field object
    const fieldObj = node.model.getField(field);
    const fieldValue = node.getValue(field);

    if (typeof fieldObj.valueConstraint !== 'undefined'
      && (typeof fieldValue !== 'string'
      || (fieldObj.valueConstraint === 'UriTemplate' && !PropertyHelper.isUrlTemplate(fieldValue))
      || (fieldObj.valueConstraint === 'UUID' && !PropertyHelper.isValidUUID(fieldValue)))) {
      errors.push(
        this.createError(
          'valueConstraint',
          {
            fieldValue,
            path: node.getPath(field),
          },
          {
            valueConstraint: fieldObj.valueConstraint,
          },
        ),
      );
    } else {
      return [];
    }

    return errors;
  }
};
