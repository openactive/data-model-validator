const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const validationErrorType = require('../../errors/validation-error-type');

/** @typedef {import('../../classes/model-node').ModelNodeType} ModelNode */

class IdReferencesForRequestsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetValidationModes = [
      'C1Request',
      'C2Request',
      'PRequest',
      'BRequest',
      'BOrderProposalRequest',
      'OrderPatch',
    ];
    this.targetModels = '*';
    this.meta = {
      name: 'IdReferencesForRequestsRule',
      description: 'Validates that acceptedOffer and orderedItem are ID references and not objects for requests (C1, C2 etc)',
      tests: {
        default: {
          description: `Raises a failure if the acceptedOffer or orderedItem within the OrderItem of a request is not a URL 
          (ie a reference to the object and not the object itself)`,
          message: 'For requests, {{field}} must be a compact ID reference, not the object representing the data itself',
          sampleValues: {
            field: 'acceptedOffer',
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
    const referencedFields = node.model.getReferencedFields(node.options.validationMode, node.name);
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

module.exports = IdReferencesForRequestsRule;
