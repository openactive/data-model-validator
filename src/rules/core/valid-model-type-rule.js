const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ValidModelTypeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.meta = {
      name: 'ValidModelTypeRule',
      description: 'Validates that objects are submitted with a recognised type.',
      tests: {
        noType: {
          message: 'Please add a `type` property to this JSON object.\n\nFor example:\n\n```\n{\n  "type": "Event"\n}\n```',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
        noTypeWithHint: {
          message: 'Objects in `{{field}}` must be of type `{{typeHint}}`. Please amend the property to `"type": "{{typeHint}}"` in the object to allow for further validation.\n\nFor example:\n\n```\n"{{field}}": {\n  "type": "{{typeHint}}"\n}\n```',
          sampleValues: {
            field: 'activity',
            typeHint: 'Concept',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
        noExperimental: {
          message: 'Type `{{type}}` is not recognised by the validator, as it is not part of the [Modelling Opportunity Data specification](https://www.openactive.io/modelling-opportunity-data/) or schema.org, and cannot be checked for validity.',
          sampleValues: {
            type: 'CreativeWork',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
        },
      },
    };
  }

  validateModel(node) {
    // Don't do this check for models that aren't JSON-LD
    if (!node.model.isJsonLd) {
      return [];
    }
    const errors = [];

    const fieldValue = node.getValue('type');
    let testKey;
    let messageValues;

    if (typeof fieldValue === 'undefined') {
      testKey = 'noType';
      // Do we have a parent node?
      if (node.parentNode !== null) {
        const fieldObj = node.parentNode.model.getField(node.name);
        if (typeof fieldObj === 'object' && fieldObj !== null) {
          const types = fieldObj.getAllPossibleTypes();
          const uniqueTypes = [...new Set(types.map(x => x.replace(/^ArrayOf/, '')))];
          if (uniqueTypes.length === 1 && uniqueTypes[0].match(/^#/)) {
            testKey = 'noTypeWithHint';
            messageValues = {
              field: node.name,
              typeHint: uniqueTypes[0].substr(1),
            };
          }
        }
      }
    } else {
      const prop = PropertyHelper.getFullyQualifiedProperty(fieldValue, node.options.version);
      if (
        (
          typeof prop !== 'undefined'
          && prop.namespace === null
          && prop.prefix === null
        )
        || !node.model.hasSpecification
      ) {
        testKey = 'noExperimental';
        messageValues = {
          type: fieldValue,
        };
      }
    }

    if (testKey) {
      errors.push(
        this.createError(
          testKey,
          {
            value: fieldValue,
            path: node.getPath(),
          },
          messageValues,
        ),
      );
    }
    return errors;
  }
};
