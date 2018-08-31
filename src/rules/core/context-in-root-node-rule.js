const DataModelHelper = require('../../helpers/data-model');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ContextInRootNodeRule extends Rule {
  constructor(options) {
    super(options);
    const metaData = DataModelHelper.getMetaData(this.options.version);
    this.targetModels = '*';
    this.meta = {
      name: 'ContextInRootNodeRule',
      description: 'Validates that @context is present in the root node, and that it is the correct format, containing the OA namespace.',
      tests: {
        noContext: {
          description: 'Raises a failure if the @context is missing from the root node.',
          message: `The @context field is required in the root node of your data. It should contain the OpenActive context (${metaData.contextUrl}) as a string or the first element in an array.`,
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
        hasContext: {
          description: 'Raises a failure if the @context is present in a non-root node.',
          message: `The @context field is required to only be in the root node of your data. It should contain the OpenActive context (${metaData.contextUrl}) as a string or the first element in an array.`,
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_SPEC,
        },
        oaNotInRightPlace: {
          description: `Validates that the @context contains the OpenActive context (${metaData.contextUrl}) as a string or the first element in an array.`,
          message: `The @context should contain the OpenActive context (${metaData.contextUrl}) as a string or the first element in an array.`,
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
        type: {
          description: 'Validates that the context is a url or an array or urls.',
          message: 'Whilst JSON-LD supports inline context objects, the @context should be a URL or array of URLs, with each URL pointing to a published context.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
      },
    };
  }

  validateModel(node) {
    if (!node.model.isJsonLd) {
      return [];
    }
    const errors = [];
    const fieldObj = node.model.getField('@context');
    const fieldValue = node.getValue('@context');
    const metaData = DataModelHelper.getMetaData(this.options.version);

    let testKey;

    // Is this the root node?
    if (node.parentNode === null || !node.parentNode.model.isJsonLd) {
      const backupField = new Field({
        requiredType: 'https://schema.org/url',
        alternativeTypes: [
          'ArrayOf#https://schema.org/url',
        ],
      }, node.options.version);

      if (typeof fieldValue === 'undefined') {
        testKey = 'noContext';
      } else if (
        (typeof fieldObj === 'undefined' || fieldObj === null)
        && !backupField.detectedTypeIsAllowed(fieldValue)
      ) {
        testKey = 'type';
      } else if (
        (
          typeof fieldValue === 'string'
          && fieldValue !== metaData.contextUrl
        )
        || (
          typeof fieldValue === 'object'
          && fieldValue instanceof Array
          && fieldValue[0] !== metaData.contextUrl
        )
      ) {
        testKey = 'oaNotInRightPlace';
      }
    } else if (typeof fieldValue !== 'undefined') {
      testKey = 'hasContext';
    }

    if (testKey) {
      errors.push(
        this.createError(
          testKey,
          {
            value: fieldValue,
            path: node.getPath('@context'),
          },
        ),
      );
    }

    return errors;
  }
};
