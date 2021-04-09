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
        uritemplate: {
          description: 'Raises a failure if the value is not a valid URI Template',
          message: 'The value of this property must adhere to the associated constraint: {{valueConstraint}}.',
          sampleValues: {
            valueConstraint: 'UriTemplate',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.VALUE_OUTWITH_CONSTRAINT,
        },
        uuid: {
          description: 'Raises a failure if the value is not a valid UUID.',
          message: 'The value of this property must adhere to the associated constraint: {{valueConstraint}}.',
          sampleValues: {
            valueConstraint: 'UUID',
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
    const fieldValue = node.getMappedValue(field);

    if (typeof fieldObj.valueConstraint !== 'undefined'
      && (fieldObj.valueConstraint === 'UriTemplate'
      && !PropertyHelper.isUrlTemplate(fieldValue))) {
      errors.push(
        this.createError(
          'uritemplate',
          {
            fieldValue,
            path: node.getPath(field),
          },
        ),
      );
    } else if (typeof fieldObj.valueConstraint !== 'undefined'
      && (fieldObj.valueConstraint === 'UUID'
      && !PropertyHelper.isValidUUID(fieldValue))) {
      errors.push(
        this.createError(
          'uuid',
          {
            fieldValue,
            path: node.getPath(field),
          },
        ),
      );
    } else {
      return [];
    }

    return errors;
  }
};
