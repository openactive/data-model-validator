const Rule = require('../rule');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const validationErrorType = require('../../errors/validation-error-type');

/** @typedef {import('../../classes/model-node').ModelNodeType} ModelNode */

class IdReferencesNotPermittedRule extends Rule {
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
      name: 'IdReferencesNotPermittedRule',
      description: 'Validates that ID references are not used where not permitted',
      tests: {
        default: {
          description: 'Raises a failure if the value of a property is a URL (i.e. it is a reference to the object and not the object itself)',
          message: 'In this validation mode `{{field}}` must be an object representing the data itself, not a compact [`@id` reference](https://permalink.openactive.io/data-model-validator/id-references) or `string`',
          sampleValues: {
            field: 'acceptedOffer',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: validationErrorType.FIELD_MUST_NOT_BE_ID_REFERENCE,
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
    const shouldNotBeReferencedFields = node.model.getShallNotBeReferencedFields(node.options.validationMode, node.name);
    for (const field of shouldNotBeReferencedFields) {
      const fieldValue = node.getValue(field);

      if (typeof fieldValue === 'string') {
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

module.exports = IdReferencesNotPermittedRule;
