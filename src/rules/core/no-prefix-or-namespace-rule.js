const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoPrefixOrNamespaceRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'NoPrefixOrNamespaceRule',
      description: 'Validates that properties that are aliased in the @context are not submitted in their unaliased form.',
      tests: {
        typeAndId: {
          description: 'Validates that @type and @id are submitted as type and id.',
          message: 'OpenActive.io maps the JSON-LD property `@{{field}}` to `{{field}}`, so `{{field}}` should always be used as the name of this property.',
          sampleValues: {
            field: 'type',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.USE_FIELD_ALIASES,
        },
        noNamespace: {
          description: 'Validates that a property in the specification is not submitted with its namespace.',
          message: 'Whilst valid JSON-LD, property `{{submittedField}}` should be included without its namespace. Simply rename this property to `{{field}}`.',
          sampleValues: {
            submittedField: 'https://schema.org/name',
            field: 'name',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.USE_FIELD_ALIASES,
        },
        noPrefix: {
          description: 'Validates that a property in the specification is not submitted with its prefix.',
          message: 'Whilst valid JSON-LD, property `{{submittedField}}` should be included without its prefix. Simply rename this property to `{{field}}`.',
          sampleValues: {
            submittedField: 'schema:name',
            field: 'name',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.USE_FIELD_ALIASES,
        },
        noNamespaceValue: {
          description: 'Validates that a property value in the specification is not submitted with its namespace.',
          message: 'Whilst valid JSON-LD, the value of property `{{field}}` should be included without its namespace. Simply change the value of this property from `{{submittedValue}}` to `{{correctedValue}}`.',
          sampleValues: {
            submittedValue: 'skos:Concept',
            correctedValue: 'Concept',
            field: 'type',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.USE_FIELD_ALIASES,
        },
        noPrefixValue: {
          description: 'Validates that a property value in the specification is not submitted with its prefix.',
          message: 'Whilst valid JSON-LD, the value of property `{{field}}` should be included without its prefix. Simply change the value of this property from `{{submittedValue}}` to `{{correctedValue}}`.',
          sampleValues: {
            submittedValue: 'https://schema.org/Event',
            correctedValue: 'Event',
            field: 'type',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.USE_FIELD_ALIASES,
        },
      },
    };
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    let testKey;
    let messageValues;

    // Get prop values
    const prop = PropertyHelper.getFullyQualifiedProperty(field, node.options.version);

    if (
      prop.alias !== null
      && prop.namespace === null
      && prop.prefix === null
      && field !== prop.alias
    ) {
      testKey = 'typeAndId';
      messageValues = {
        field: prop.alias,
      };
    } else if (
      (
        prop.alias !== null
        || prop.prefix === 'schema'
      ) && node.model.inSpec.indexOf(prop.label) >= 0
    ) {
      if (`${prop.prefix}:${prop.label}` === field) {
        testKey = 'noPrefix';
      } else if (`${prop.namespace}${prop.label}` === field) {
        testKey = 'noNamespace';
      }
      if (testKey) {
        messageValues = {
          field: prop.alias || prop.label,
          submittedField: field,
        };
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
    if (prop.alias === 'type') {
      // Check the value of this
      const fieldValue = node.getValue(field);
      const valueProp = PropertyHelper.getFullyQualifiedProperty(fieldValue, node.options.version);
      let testKeyValue;
      if (`${valueProp.prefix}:${valueProp.label}` === fieldValue) {
        testKeyValue = 'noPrefixValue';
      } else if (`${valueProp.namespace}${valueProp.label}` === fieldValue) {
        testKeyValue = 'noNamespaceValue';
      }
      if (testKeyValue) {
        errors.push(
          this.createError(
            testKeyValue,
            {
              value: node.getValue(field),
              path: node.getPath(field),
            },
            {
              field,
              submittedValue: fieldValue,
              correctedValue: valueProp.alias || valueProp.label,
            },
          ),
        );
      }
    }
    return errors;
  }
};
