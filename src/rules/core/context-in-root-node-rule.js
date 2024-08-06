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
          message: `The \`@context\` property is required in the root object. It must contain the OpenActive context ("${metaData.contextUrl}") as a string or the first element in an array.\n\nFor example:\n\n\`\`\`\n{\n  "@context": "${metaData.contextUrl}",\n  "@type": "Event"\n}\n\`\`\``,
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
        hasContext: {
          description: 'Raises a failure if the @context is present in a non-root node.',
          message: 'The `@context` property must only be present in the root object. Please ensure that this property is not present in other objects.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_SPEC,
        },
        oaNotInRightPlace: {
          description: `Validates that the @context contains the OpenActive context (${metaData.contextUrl}) as a string or the first element in an array.`,
          message: `The \`@context\` property must contain the OpenActive context (\`"${metaData.contextUrl}"\`) as a string or the first element in an array.\n\nFor example:\n\n\`\`\`\n{\n  "@context": "${metaData.contextUrl}",\n  "@type": "Event"\n}\n\`\`\``,
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
        contextIncorrectForDatasetSite: {
          description: `For a Dataset Site, validates that the @context contains the schema.org context (${metaData.namespaces.schema}) and OpenActive context (${metaData.contextUrl}) as the first and second elements in an array, respectively.`,
          message: `For a Dataset Site, the \`@context\` property must be present in the root object and contain the schema.org context (\`"${metaData.namespaces.schema}"\`) and OpenActive context (\`"${metaData.contextUrl}"\`) as the first and second elements in an array, respectively.\n\nFor example:\n\n\`\`\`\n{\n  "@context": [\n    "${metaData.namespaces.schema}",\n    "${metaData.contextUrl}"\n  ],\n  "@type": "Dataset"\n}\n\`\`\``,
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
        contextIncorrectForDataCatalog: {
          description: `For a DataCatalog, validates that the @context contains only the schema.org context (${metaData.namespaces.schema}) as a string.`,
          message: `For a \`DataCatalog\`, the \`@context\` property must be present in the root object and must contain the schema.org context (\`"${metaData.namespaces.schema}"\`) as a string.\n\nFor example:\n\n\`\`\`\n{\n  "@context": "${metaData.namespaces.schema}",\n  "@type": "DataCatalog"\n}\n\`\`\``,
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
        type: {
          description: 'Validates that the context is a url or an array or urls.',
          message: `Whilst JSON-LD supports inline context objects, for use in OpenActive the \`@context\` property must contain a URL or array of URLs, with each URL pointing to a published context.\n\nThe \`@context\` property must also contain the OpenActive context (\`"${metaData.contextUrl}"\`) as the first element in this array.`,
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
        requiredType: 'https://schema.org/URL',
        alternativeTypes: [
          'ArrayOf#https://schema.org/URL',
        ],
      }, node.options.version);

      if (node.options.validationMode === 'DatasetSite') {
        if (
          typeof fieldValue !== 'object'
          || !(fieldValue instanceof Array)
          || fieldValue[0] !== metaData.namespaces.schema
          || fieldValue[1] !== metaData.contextUrl
        ) {
          testKey = 'contextIncorrectForDatasetSite';
        }
      } else if (node.options.validationMode === 'DataCatalog') {
        if (
          typeof fieldValue !== 'string'
          || fieldValue !== metaData.namespaces.schema
        ) {
          testKey = 'contextIncorrectForDataCatalog';
        }
      } else if (typeof fieldValue === 'undefined') {
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
