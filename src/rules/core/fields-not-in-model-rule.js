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
      description: 'Validates that all properties are present in the specification.',
      tests: {
        invalidExperimental: {
          description: 'Raises a notice if experimental properties are detected, but have no definition in the @context.',
          message: 'No definition for this extension property could be found. Extension properties must be described by a published JSON-LD definition, which must be referred to in the `@context`. Please check that you have a published context defined, and that this property is defined within it.\n\nFor more information about extension properties, see the [extension properties guide](https://openactive.io/modelling-opportunity-data/EditorsDraft/#defining-and-using-custom-namespaces).',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
        invalidBeta: {
          description: 'Raises a notice if unrecognised Beta properties are detected.',
          message: 'No definition for this `beta` property could be found. Please check that your `@context` includes `"https://openactive.io/ns-beta"` [as shown in this example](https://openactive.io/ns-beta/#example-use), and then check the property name exactly matches one in the list of available `beta:` properties in the [Beta Namespace](https://openactive.io/ns-beta/#namespace).\n\nIf you would like to define a custom property that is not covered by `beta:`, consider using an extension property. For more information about extension properties, see the [extension properties guide](https://openactive.io/modelling-opportunity-data/EditorsDraft/#defining-and-using-custom-namespaces).',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
        invalidExperimentalNotInDomain: {
          description: 'Raises a notice if experimental properties are detected, but have no definition in the @context.',
          message: 'A definition for this extension property was found, but it has not been included in the correct object type. Please check the spelling of this property and ensure that you are using it within the correct object `"@type"`.\n\nThe types allowed for this property are:\n\n{{domains}}\n\nFor more information about extension properties, see the [extension properties guide](https://openactive.io/modelling-opportunity-data/EditorsDraft/#defining-and-using-custom-namespaces).',
          sampleValues: {
            domains: '<ul><li>https://schema.org/Place</li></ul>',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
        invalidBetaNotInDomain: {
          description: 'Raises a notice if Beta properties are detected, but are included in the wrong type',
          message: 'A definition for this `beta` property was found, but it has not been included in the correct object type. Please check the spelling of this property and ensure that you are using it within the correct object `"@type"`.\n\nThe types allowed for this property are:\n\n{{domains}}\n\nIf you would like to use this `beta:` property for a type other than those listed, please find the relevant proposal\'s GitHub issue in the [Beta Namespace](https://openactive.io/ns-beta/#namespace) and make your request known.',
          sampleValues: {
            domains: '<ul><li>https://schema.org/Place</li></ul>',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
        invalidExperimentalDomainNotFound: {
          description: 'Raises a notice if experimental properties are detected, but have no definition in the @context.',
          message: 'A definition for this extension property was found, but a check could not be performed to assess whether it has been included in the correct object `"@type"`.\n\nFor more information about extension properties, see the [extension properties guide](https://openactive.io/modelling-opportunity-data/EditorsDraft/#defining-and-using-custom-namespaces).',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
        extensionErrorCode: {
          message: 'Could not validate `{{field}}` property because the `"@context"` value `"{{context}}"` did not return a valid HTTP status. The server returned an error {{code}}.\n\nPlease check the `"@context"` property in the root object to ensure all values are valid.\n\nThe correct way to reference the OpenActive contexts is using these URLs:\n\n <ul><li>`"https://openactive.io/"` (always required)</li><li>`"https://openactive.io/ns-beta"` (only required if using `beta:` properties)</li></ul>',
          sampleValues: {
            context: 'https://openactive.io/ns-beta',
            code: 500,
            field: 'actor',
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FILE_NOT_FOUND,
        },
        extensionInvalid: {
          message: 'Could not validate `{{field}}` property because the `"@context"` value `"{{context}}"` did not return a valid JSON response. Please check that it contains a JSON document in the format described in [the specification](https://openactive.io/modelling-opportunity-data/EditorsDraft/#defining-and-using-custom-namespaces).\n\nAdditionally, please check the `"@context"` property in the root object to ensure all values are valid.\n\nThe correct way to reference the OpenActive contexts is using these URLs:\n\n <ul><li>`"https://openactive.io/"` (always required)</li><li>`"https://openactive.io/ns-beta"` (only required if using `beta:` properties)</li></ul>',
          sampleValues: {
            context: 'https://openactive.io/ns-beta',
            field: 'actor',
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FILE_NOT_FOUND,
        },
        extensionComplex: {
          message: 'Context "{{context}}" contains nested contexts that cannot be processed by the validator at this time.',
          sampleValues: {
            context: 'https://openactive.io/ns-beta',
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
        extensionGraph: {
          message: 'Context "{{context}}" contains a `@graph` property that cannot be processed by the validator at this time.',
          sampleValues: {
            context: 'https://openactive.io/ns-beta',
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
        typoHint: {
          description: 'Detects common typos, and raises a warning informing on how to correct.',
          message: '`{{typoField}}` is a common misspelling for the property `{{actualField}}`. Please correct this property to `{{actualField}}`.',
          sampleValues: {
            typoField: 'offer',
            actualField: 'offers',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_COULD_BE_TYPO,
        },
        inSchemaOrg: {
          description: 'Raises a notice that properties in the schema.org schema that aren\'t in the OpenActive specification aren\'t checked by the validator.',
          message: '`schema:{{field}}` is declared in schema.org but this validator is not yet capable of checking whether they have the right format or values. You should refer to the schema.org documentation for [schema:{{field}}](https://schema.org/{{field}}) for additional guidance.',
          sampleValues: {
            field: 'actor',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.SCHEMA_ORG_FIELDS_NOT_CHECKED,
        },
        notInSpec: {
          description: 'Raises a error for properties that aren\'t in the OpenActive specification, and that aren\'t caught by other rules.',
          message: 'This property is not defined in the OpenActive specification. Data publishers are encouraged to publish as many data properties as possible, and for those that don\'t match the specification, to use [extension properties](https://openactive.io/modelling-opportunity-data/EditorsDraft/#defining-and-using-custom-namespaces).\n\nFor example:\n\n```\n{\n  "ext:{{field}}": "my custom data"\n}\n```\n\nIf you are trying to use a recognised property, please check the spelling and ensure that you are using it within the correct object `"@type"`. Otherwise if you are trying to add your own property, simply rename it to `ext:{{field}}`.',
          sampleValues: {
            field: 'myCustomPropertyName',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_SPEC,
        },
        notAllowed: {
          description: 'Raises an for properties that are explicitly disallowed by a model.',
          message: 'This property is not allowed in {{model}}.',
          sampleValues: {
            model: 'HeadlineEvent',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC,
        },
        superseded: {
          description: 'Raises an error for properties that have been superseded.',
          message: 'This term has graduated from the beta namespace and is highly likely to be removed in future, please use `{{field}}` instead.',
          sampleValues: {
            field: 'supersedingField',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC,
        },
        supersededFeed: {
          description: 'Raises an error for properties that have been superseded.',
          message: 'This term has graduated from the beta namespace and is highly likely to be removed in future, please use `{{field}}` instead.',
          sampleValues: {
            field: 'supersedingField',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC,
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

  async getContexts(node, field) {
    const rootNode = this.constructor.getRootJsonLdNode(node);
    let contexts = rootNode.getValue('@context');
    if (
      typeof contexts !== 'string'
      && !(contexts instanceof Array)
    ) {
      return {
        errors: [],
        contexts: [],
      };
    }
    if (!(contexts instanceof Array)) {
      contexts = [contexts];
    }

    const metaData = DataModelHelper.getMetaData(this.options.version);
    const returnContexts = [];
    const errors = [];

    for (const url of contexts) {
      if (typeof url === 'string' && url !== metaData.contextUrl) {
        const jsonResponse = await JsonLoaderHelper.getFile(url, node.options);
        if (
          jsonResponse.errorCode === JsonLoaderHelper.ERROR_NONE
          && typeof jsonResponse.data === 'object'
          && jsonResponse.data !== null
        ) {
          const returnedContext = jsonResponse.data;
          if (typeof returnedContext['@context'] !== 'undefined') {
            if (returnedContext['@context'] instanceof Array) {
              let index = 0;
              for (const subContext of returnedContext['@context']) {
                if (typeof subContext === 'string') {
                  const subJsonResponse = await JsonLoaderHelper.getFile(subContext, node.options);
                  const subReturnedContext = subJsonResponse.data;
                  if (
                    typeof subReturnedContext['@context'] === 'object'
                    && subReturnedContext['@context'] !== null
                    && !(subReturnedContext['@context'] instanceof Array)
                  ) {
                    returnedContext['@context'][index] = subReturnedContext['@context'];
                  } else {
                    errors.push(
                      this.createError(
                        'extensionComplex',
                        {
                          value: subContext,
                          path: node.getPath(field),
                        },
                        {
                          context: subContext,
                        },
                      ),
                    );
                  }
                  if (typeof subReturnedContext['@graph'] !== 'undefined') {
                    errors.push(
                      this.createError(
                        'extensionGraph',
                        {
                          value: subContext,
                          path: node.getPath(field),
                        },
                        {
                          context: subContext,
                        },
                      ),
                    );
                  }
                }
                index += 1;
              }
            }
          }
          returnContexts.push(returnedContext);
        } else if (
          jsonResponse.statusCode !== 200
          && jsonResponse.statusCode !== null
        ) {
          errors.push(
            this.createError(
              'extensionErrorCode',
              {
                value: url,
                path: node.getPath(field),
              },
              {
                context: url,
                code: jsonResponse.statusCode,
                field,
              },
            ),
          );
        } else {
          errors.push(
            this.createError(
              'extensionInvalid',
              {
                value: url,
                path: node.getPath(field),
              },
              {
                context: url,
                field,
              },
            ),
          );
        }
      } else if (typeof url === 'object' && url !== null) {
        returnContexts.push(url);
      }
    }
    return {
      contexts: returnContexts,
      errors,
    };
  }

  async validateField(node, field) {
    const schemaOrgVocab = DataModelHelper.getSchemaOrgVocab();
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    // Ignore @context - covered by ContextInRootNodeRule
    if (field === '@context') {
      return [];
    }
    // Don't do this check for cases where the JSON-LD type does not match the expected model
    // Other rules will raise an error if the type itself is invalid, and if this type is an
    // extension the validator cannot yet validate properties within the type anyway,
    // so in either case this rule should not run.
    // TODO: Remove this and improve the rule to validate beta and extension types
    if (node.model.isJsonLd && node.model.type !== node.getValue('type')) {
      return [];
    }
    let errors = [];
    let testKey = null;
    let messageValues;
    if (node.model.hasFieldNotInSpec(field)) {
      testKey = 'notAllowed';
      messageValues = {
        model: node.model.type,
      };
    } else if (!node.model.hasFieldInSpec(field)) {
      // Get prop values
      const contextInfo = await this.getContexts(node, field);
      errors = errors.concat(contextInfo.errors);
      const prop = PropertyHelper.getFullyQualifiedProperty(field, this.options.version, contextInfo.contexts);
      const metaData = DataModelHelper.getMetaData(this.options.version);
      const oaContext = {
        '@context': DataModelHelper.getContext(this.options.version),
        '@graph': DataModelHelper.getGraph(this.options.version),
      };
      if (Object.keys(metaData.namespaces).indexOf(prop.prefix) < 0) {
        if (
          prop.namespace === null
          && prop.prefix === null
        ) {
          if (field.substring(0, 5) === 'beta:') {
            testKey = 'invalidBeta';
          } else {
            testKey = 'invalidExperimental';
          }
        } else {
          // We should see if this field is even allowed in this model
          let isDefined = false;
          let graphResponse;
          for (const context of contextInfo.contexts) {
            let model;
            // Use derivedFrom to infer model namespace
            if (typeof node.model.derivedFrom === 'string') {
              model = node.model.derivedFrom;
            } else {
              model = `${metaData.openActivePrefix}:${node.model.type}`;
            }
            graphResponse = GraphHelper.isPropertyInClass(
              context,
              field,
              model,
              node.options.version,
              [oaContext, schemaOrgVocab],
            );
            if (graphResponse.code === GraphHelper.PROPERTY_FOUND) {
              if (graphResponse.data.supersededBy) {
                if (node.options.validationMode === 'RPDEFeed') {
                  testKey = 'supersededFeed';
                } else {
                  testKey = 'superseded';
                }

                messageValues = {
                  field: graphResponse.data.supersededBy,
                };
              }

              isDefined = true;
              break;
            }
            if (
              graphResponse.code === GraphHelper.PROPERTY_NOT_IN_DOMAIN
              || graphResponse.code === GraphHelper.PROPERTY_DOMAIN_NOT_FOUND
            ) {
              break;
            }
          }
          if (!isDefined) {
            switch (graphResponse.code) {
              case GraphHelper.PROPERTY_NOT_IN_DOMAIN:
                if (field.substring(0, 5) === 'beta:') {
                  testKey = 'invalidBetaNotInDomain';
                } else {
                  testKey = 'invalidExperimentalNotInDomain';
                }
                messageValues = {
                  domains: `<ul><li>${graphResponse.data.join('</li><li>')}</li></ul>`,
                };
                break;
              case GraphHelper.PROPERTY_DOMAIN_NOT_FOUND:
                testKey = 'invalidExperimentalDomainNotFound';
                break;
              case GraphHelper.PROPERTY_NOT_FOUND:
              default:
                if (field.substring(0, 5) === 'beta:') {
                  testKey = 'invalidBeta';
                } else {
                  testKey = 'invalidExperimental';
                }
                break;
            }
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
        let fieldToTest = field;
        if (prop.prefix === 'schema') {
          fieldToTest = prop.label;
        }
        // Use baseSchemaClass to indicate the most relevant schema.org base class within which to search for properties
        if (typeof node.model.baseSchemaClass === 'string') {
          for (const spec of [schemaOrgVocab]) {
            const graphResponse = GraphHelper.isPropertyInClass(
              spec,
              `schema:${fieldToTest}`,
              node.model.baseSchemaClass,
              node.options.version,
            );
            if (graphResponse.code === GraphHelper.PROPERTY_FOUND) {
              inSchemaOrg = true;
              break;
            }
          }
        }
        if (inSchemaOrg) {
          testKey = 'inSchemaOrg';
          messageValues = {
            field: prop.label,
          };
        } else {
          testKey = 'notInSpec';
          messageValues = {
            field: prop.label,
          };
        }
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
    return errors;
  }
};
