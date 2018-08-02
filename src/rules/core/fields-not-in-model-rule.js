const { namespaces } = require('openactive-data-models');
const Rule = require('../rule');
const GraphHelper = require('../../helpers/graph');
const PropertyHelper = require('../../helpers/property');
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
        noExperimental: {
          description: 'Raises a notice if experimental fields are detected.',
          message: 'The validator does not currently check experimental fields.',
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
          description: 'Raises a notice that fields in the schema.org schema that aren\'t in the Open Active specification aren\'t checked by the validator.',
          message: 'This field is declared in schema.org but this validator is not yet capable of checking whether they have the right format or values. You should refer to the schema.org documentation for additional guidance.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.SCHEMA_ORG_FIELDS_NOT_CHECKED,
        },
        notInSpec: {
          description: 'Raises a warning for fields that aren\'t in the Open Active specification, and that aren\'t caught by other rules.',
          message: 'This field is not defined in the Open Active specification.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.FIELD_NOT_IN_SPEC,
        },
      },
    };
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
      const prop = PropertyHelper.getFullyQualifiedProperty(field);

      if (
        prop.alias === null
        && Object.keys(namespaces).indexOf(prop.prefix) < 0
      ) {
        testKey = 'noExperimental';
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
            if (GraphHelper.isPropertyInClass(spec, field, node.model.derivedFrom)) {
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
