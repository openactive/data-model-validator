const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const validationErrorType = require('../../errors/validation-error-type');

/** @typedef {import('../../classes/model-node').ModelNodeType} ModelNode */

class IdReferencesForFeedsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetValidationModes = [
      'RPDEFeed',
      'BookableRPDEFeed',
    ];
    this.targetRpdeKinds = [
      'FacilityUse/Slot',
      'IndividualFacilityUse/Slot',
      'ScheduledSession',
    ];
    this.targetModels = '*';
    this.meta = {
      name: 'IdReferencesForFeedsRule',
      description: 'Validates that certain properties in the specified feeds are an ID reference and not objects',
      tests: {
        default: {
          description: `Raises a failure if properties within the data object in a RPDE Feed is not an ID reference
          (ie a reference to the object and not the object itself)`,
          message: 'For {{rpdeKind}} feeds, {{field}} must be an compact ID reference, not the object representing the data itself',
          sampleValues: {
            feed: 'FacilityUse/Slot',
            field: 'facilityUse',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: validationErrorType.FIELD_NOT_ID_REFERENCE,
        },
      },
    };
  }

  /**
   * @param {ModelNode} node
   */
  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for or for models that aren't JSON-LD
    if (!node.model.hasSpecification || !node.model.isJsonLd) {
      return [];
    }

    const errors = [];
    const referencedFields = node.model.getReferencedFields(node.options.validationMode, { rpdeKind: node.options.rpdeKind });
    for (const field of referencedFields) {
      const fieldValue = node.getValue(field);

      if (typeof fieldValue !== 'string' || !PropertyHelper.isUrl(fieldValue)) {
        errors.push(
          this.createError(
            'default',
            {
              fieldValue,
              path: node.getPath(field),
            },
            { referencedField: field },
          ),
        );
      }
    }

    return errors;
  }
}

module.exports = {
  IdReferencesForFeedsRule,
};
