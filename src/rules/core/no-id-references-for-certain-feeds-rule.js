const _ = require('lodash');
const Rule = require('../rule');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const validationErrorType = require('../../errors/validation-error-type');

/** @typedef {import('../../classes/model-node').ModelNodeType} ModelNode */

class NoIdReferencesForCertainFeedsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetValidationModes = [
      'RPDEFeed',
      'BookableRPDEFeed',
    ];
    this.targetRpdeKinds = [
      'ScheduledSession.SessionSeries',
    ];
    this.targetModels = '*';
    this.meta = {
      name: 'NoIdReferencesForCertainFeedsRule',
      description: 'Validates that certain properties in the specified feeds are not an ID reference and are objects',
      tests: {
        default: {
          description: `Raises a failure if properties within the data object in a RPDE Feed is an ID reference
          (ie a reference to the object and not the object itself)`,
          message: 'For {{rpdeKind}} feeds, {{field}} must be not an compact ID reference, but the object representing the data itself',
          sampleValues: {
            feed: 'ScheduledSession.SessionSeries',
            field: 'superEvent',
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

module.exports = NoIdReferencesForCertainFeedsRule;
