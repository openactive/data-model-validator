const _ = require('lodash');
const Rule = require('../rule');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const validationErrorType = require('../../errors/validation-error-type');

/** @typedef {import('../../classes/model-node').ModelNodeType} ModelNode */

class NoIdReferencesForResponsesRule extends Rule {
  constructor(options) {
    super(options);
    this.targetValidationModes = [
      'C1Response',
      'C2Response',
      'PResponse',
      'BResponse',
      'OrdersFeed',
      'OrderStatus',
    ];
    this.targetModels = '*';
    this.meta = {
      name: 'NoIdReferencesForResponsesRule',
      description: 'Validates that acceptedOffer and orderedItem are not ID references and are objects for responses (C1, C2 etc)',
      tests: {
        default: {
          description: `Raises a failure if the acceptedOffer or orderedItem within the OrderItem of a response is a URL 
          (ie a reference to the object and not the object itself)`,
          message: 'For responses, {{field}} must not be a compact ID reference, but the object representing the data itself',
          sampleValues: {
            field: 'acceptedOffer',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: validationErrorType.FIELD_SHOUlD_NOT_BE_ID_REFERENCE,
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
    const shouldNotBeReferencedFields = node.model.getShallNotBeReferencedFields(node.options.validationMode, { rpdeKind: node.options.rpdeKind });
    for (const field of shouldNotBeReferencedFields) {
      const fieldValue = node.getValue(field);

      if (!_.isPlainObject(fieldValue)) {
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

module.exports = NoIdReferencesForResponsesRule;
