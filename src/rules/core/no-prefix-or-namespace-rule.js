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
      description: 'Validates that fields that are aliased in the @context are not submitted in their unaliased form.',
      tests: {
        typeAndId: {
          description: 'Validates that @type and @id are submitted as type and id.',
          message: 'Field "@{{field}}" should be submitted as "{{field}}"',
          sampleValues: {
            field: 'type',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.USE_FIELD_ALIASES,
        },
        noNamespace: {
          description: 'Validates that a field in the specification is not submitted with its namespace.',
          message: 'Whilst valid JSON-LD, field "{{submittedField}}" should be submitted without its namespace as "{{field}}".',
          sampleValues: {
            submittedField: 'http://schema.org/name',
            field: 'name',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.USE_FIELD_ALIASES,
        },
        noPrefix: {
          description: 'Validates that a field in the specification is not submitted with its prefix.',
          message: 'Whilst valid JSON-LD, field "{{submittedField}}" should be submitted without its prefix as "{{field}}".',
          sampleValues: {
            submittedField: 'schema:name',
            field: 'name',
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
    const prop = PropertyHelper.getFullyQualifiedProperty(field);

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
    return errors;
  }
};
