const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class FieldsCorrectTypeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'FieldsCorrectTypeRule',
      description: 'Validates that all fields are the correct type.',
      tests: {
        singleType: {
          description: 'Validates that a field conforms to a single type.',
          message: 'Invalid type, expected {{expectedType}} but found {{foundType}}.',
          sampleValues: {
            expectedType: '"http://schema.org/Text"',
            foundType: '"http://schema.org/Float"',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
        multipleTypes: {
          description: 'Validates that a field conforms one of a list of types.',
          message: 'Invalid type, expected one of {{expectedTypes}} but found {{foundType}}.',
          sampleValues: {
            expectedTypes: '"http://schema.org/Text", "ArrayOf#http://schema.org/Text"',
            foundType: '"http://schema.org/Float"',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
      },
    };
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const fieldObj = node.model.getField(field);
    if (typeof fieldObj === 'undefined') {
      return [];
    }

    // Get the derived type
    const fieldValue = fieldObj.getMappedValue(node.value);
    const derivedType = fieldObj.detectType(fieldValue);

    const typeChecks = fieldObj.getAllPossibleTypes();

    // TODO: Should this throw an error..?
    if (typeChecks.length === 0) {
      return [];
    }

    const checkPass = fieldObj.detectedTypeIsAllowed(fieldValue);

    const errors = [];

    if (!checkPass) {
      let testKey;
      let messageValues = {};
      if (typeChecks.length === 1) {
        testKey = 'singleType';
        messageValues = {
          expectedType: `"${typeChecks[0]}"`,
          foundType: `"${derivedType}"`,
        };
      } else {
        testKey = 'multipleTypes';
        messageValues = {
          expectedTypes: `"${typeChecks.join('", "')}"`,
          foundType: `"${derivedType}"`,
        };
      }
      errors.push(
        this.createError(
          testKey,
          {
            value: fieldValue,
            path: `${node.getPath()}.${field}`,
          },
          messageValues,
        ),
      );
    }

    return errors;
  }
};
