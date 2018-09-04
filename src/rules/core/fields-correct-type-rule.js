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
      description: 'Validates that all properties are the correct type.',
      tests: {
        noValueObjects: {
          description: 'Raises a notice if a JSON-LD value object is found.',
          message: 'Whilst value objects are valid JSON-LD, they are not part of the OpenActive specification. Please use a JavaScript primitive type instead.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.UNSUPPORTED_VALUE,
        },
        singleType: {
          description: 'Validates that a property conforms to a single type.',
          message: 'Invalid type, expected {{expectedType}} but found {{foundType}}.',
          sampleValues: {
            expectedType: '"https://schema.org/Text"',
            foundType: '"https://schema.org/Float"',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
        multipleTypes: {
          description: 'Validates that a property conforms one of a list of types.',
          message: 'Invalid type, expected one of {{expectedTypes}} but found {{foundType}}.',
          sampleValues: {
            expectedTypes: '"https://schema.org/Text", "ArrayOf#https://schema.org/Text"',
            foundType: '"https://schema.org/Float"',
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
    if (!node.model.hasSpecification || !node.model.isJsonLd) {
      return [];
    }
    const fieldObj = node.model.getField(field);
    if (typeof fieldObj === 'undefined') {
      return [];
    }

    const errors = [];

    // Get the derived type
    const fieldValue = node.getMappedValue(field);
    const derivedType = fieldObj.detectType(fieldValue);

    const typeChecks = fieldObj.getAllPossibleTypes();

    // TODO: Should this throw an error..?
    if (typeChecks.length === 0) {
      return [];
    }

    const checkPass = fieldObj.detectedTypeIsAllowed(fieldValue);

    if (!checkPass) {
      let testKey;
      let messageValues = {};
      // Check whether we have a value object
      if (
        typeof fieldValue === 'object'
        && fieldValue !== null
        && typeof fieldValue.type === 'undefined'
        && typeof fieldValue['@type'] === 'undefined'
        && typeof fieldValue['@value'] !== 'undefined'
      ) {
        testKey = 'noValueObjects';
      } else if (typeChecks.length === 1) {
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
            path: node.getPath(field),
          },
          messageValues,
        ),
      );
    }

    return errors;
  }
};
