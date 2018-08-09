const DataModelHelper = require('../../helpers/data-model');
const Rule = require('../rule');
const GraphHelper = require('../../helpers/graph');
const PropertyHelper = require('../../helpers/property');
const JsonLoaderHelper = require('../../helpers/json-loader');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class FieldsNotInModelRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'FieldsNotInModelRule',
      description: 'Validates that all fields are present in the specification.',
      tests: {
        invalidExperimental: {
          description: 'Raises a notice if experimental fields are detected, but have no definition in the @context.',
          message: 'No definition for this extension field could be found. Extension fields should be described by a published JSON-LD definition, which should be referred to in the @context. Please check that you have a published context defined, and that this field is defined within it.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
        typoHint: {
          description: 'Detects common typos, and raises a warning informing on how to correct.',
          message: 'Field "{{typoField}}" is a common typo for "{{actualField}}". Please correct this field to "{{actualField}}".',
          sampleValues: {
            typoField: 'offer',
            actualField: 'offers',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_COULD_BE_TYPO,
        },
        inSchemaOrg: {
          description: 'Raises a notice that fields in the schema.org schema that aren\'t in the OpenActive specification aren\'t checked by the validator.',
          message: 'This field is declared in schema.org but this validator is not yet capable of checking whether they have the right format or values. You should refer to the schema.org documentation for additional guidance.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.SCHEMA_ORG_FIELDS_NOT_CHECKED,
        },
        notInSpec: {
          description: 'Raises a warning for fields that aren\'t in the OpenActive specification, and that aren\'t caught by other rules.',
          message: 'This field is not defined in the OpenActive specification.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.FIELD_NOT_IN_SPEC,
        },
      },
    };
  }

  static getRootJsonLdNode(node) {
    // Is this the root node?
    let testNode = node;
    while (testNode.parentNode !== null && testNode.parentNode.model.isJsonLd) {
      testNode = testNode.parentNode;
    }
    return testNode;
  }

  getContexts(node) {
    const rootNode = this.constructor.getRootJsonLdNode(node);
    let contexts = rootNode.getValue('@context');
    if (
      typeof contexts !== 'string'
      && !(contexts instanceof Array)
    ) {
      return [];
    }
    if (!(contexts instanceof Array)) {
      contexts = [contexts];
    }

    const metaData = DataModelHelper.getMetaData(this.options.version);
    const returnContexts = [];

    for (const url of contexts) {
      if (url !== metaData.contextUrl) {
        const jsonResponse = JsonLoaderHelper.getFile(url, node.options);
        if (
          jsonResponse.errorCode === JsonLoaderHelper.ERROR_NONE
          && typeof jsonResponse.data === 'object'
          && jsonResponse.data !== null
        ) {
          returnContexts.push(jsonResponse.data);
        }
      }
    }
    return returnContexts;
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    // Ignore @context - covered by ContextInRootNodeRule
    if (field === '@context') {
      return [];
    }
    const errors = [];
    let testKey = null;
    let messageValues;
    if (!node.model.hasFieldInSpec(field)) {
      // Get prop values
      const contexts = this.getContexts(node);
      const prop = PropertyHelper.getFullyQualifiedProperty(field, this.options.version, contexts);
      const metaData = DataModelHelper.getMetaData(this.options.version);
      if (Object.keys(metaData.namespaces).indexOf(prop.prefix) < 0) {
        if (
          prop.namespace === null
          && prop.prefix === null
        ) {
          testKey = 'invalidExperimental';
        } else {
          // We should see if this field is even allowed in this model
          let isDefined = false;
          for (const context of contexts) {
            let model;
            if (typeof node.model.derivedFrom !== 'undefined') {
              model = node.model.derivedFrom;
            } else {
              model = `${metaData.openActivePrefix}:${node.model.type}`;
            }
            if (GraphHelper.isPropertyInClass(context, field, model, node.options.version)) {
              isDefined = true;
              break;
            }
          }
          if (!isDefined) {
            testKey = 'invalidExperimental';
          }
        }
      } else if (typeof node.model.commonTypos[field] !== 'undefined') {
        testKey = 'typoHint';
        messageValues = {
          typoField: field,
          actualField: node.model.commonTypos[field],
        };
      } else {
        // Is this in schema.org?
        let inSchemaOrg = false;
        if (typeof node.model.derivedFrom !== 'undefined') {
          for (const spec of node.options.schemaOrgSpecifications) {
            if (GraphHelper.isPropertyInClass(spec, `schema:${field}`, node.model.derivedFrom, node.options.version)) {
              inSchemaOrg = true;
              break;
            }
          }
        }
        if (inSchemaOrg) {
          testKey = 'inSchemaOrg';
        } else {
          testKey = 'notInSpec';
        }
      }
      if (testKey) {
        errors.push(
          this.createError(
            testKey,
            {
              value: node.getValue(field),
              path: node.getPath(field),
            },
            messageValues,
          ),
        );
      }
    }
    return errors;
  }
};
