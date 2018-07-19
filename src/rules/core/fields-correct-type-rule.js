const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class FieldsCorrectTypeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that all fields are the correct type.';
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    if (typeof (node.model.fields[field]) === 'undefined') {
      return [];
    }

    // Get the derived type
    const fieldObj = new Field(node.model.fields[field]);
    const derivedType = fieldObj.detectType(node.value[field]);

    const typeChecks = fieldObj.getAllPossibleTypes();

    // TODO: Should this throw an error..?
    if (typeChecks.length === 0) {
      return [];
    }

    const checkPass = fieldObj.detectedTypeIsAllowed(node.value[field]);
    const errors = [];

    if (!checkPass) {
      let message;
      if (typeChecks.length === 1) {
        message = `Invalid type, expected '${typeChecks[0]}' but found '${derivedType}'`;
      } else {
        message = `Invalid type, expected one of '${typeChecks.join("', '")}' but found '${derivedType}'`;
      }
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.CONFORMANCE,
            type: ValidationErrorType.INVALID_TYPE,
            message,
            value: node.value[field],
            severity: ValidationErrorSeverity.FAILURE,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
    }

    return errors;
  }
};
