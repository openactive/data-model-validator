const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const validationErrorType = require('../../errors/validation-error-type');

/** @typedef {import('../../classes/model-node').ModelNodeType} ModelNode */

class IdReferencesRequiredRule extends Rule {
  constructor(options) {
    super(options);
    this.targetValidationModes = [
      'C1Request',
      'C1Response',
      'C1ResponseOrderItemError',
      'C2Request',
      'C2Response',
      'C2ResponseOrderItemError',
      'PRequest',
      'PResponse',
      'PResponseOrderItemError',
      'BRequest',
      'BOrderProposalRequest',
      'BResponse',
      'BResponseOrderItemError',
      'OrderProposalPatch',
      'OrderPatch',
      'OrdersFeed',
      'OrderStatus',
    ];
    this.targetModels = '*';
    this.meta = {
      name: 'IdReferencesRequiredRule',
      description: 'Validates that ID references are used where permitted',
      tests: {
        default: {
          description: 'Raises a failure if the value of a property is not a URL (i.e. it is the object itself, not a reference to the object)',
          message: 'In this validation mode `{{field}}` must be a compact [`@id` reference](https://permalink.openactive.io/data-model-validator/id-references), not the object representing the data itself. Note that the `@id` URL does not need to resolve to an endpoint, it is simply used as a globally unique identifier.\n\nAn `@id` reference looks like this:\n\n```\n"{{field}}": "https://id.example.com/api/session-series/1402CBP20150217"\n```',
          sampleValues: {
            field: 'acceptedOffer',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: validationErrorType.FIELD_MUST_BE_ID_REFERENCE,
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

      if (typeof fieldValue !== 'undefined' && (typeof fieldValue !== 'string' || !PropertyHelper.isUrl(fieldValue))) {
        errors.push(
          this.createError(
            'default',
            {
              fieldValue,
              path: node.getPath(field),
            },
            { field },
          ),
        );
      }
    }

    return errors;
  }
}

module.exports = IdReferencesRequiredRule;
