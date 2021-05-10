const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class IdRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'IdRule',
      description: 'Validates that all @id property values are valid URLs.',
      tests: {
        idInvalid: {
          description: 'Raises a failure if an @id value is not a valid URL',
          message: 'The value of `@id` must always be an absolute URL.\n\n`@id` properties are used as identifiers for compatibility with JSON-LD. The value of such a property must always be an absolute URI that provides a stable globally unique identifier for the resource, as described in [RFC3986](https://tools.ietf.org/html/rfc3986).\n\nThe primary purpose of the URI format in this context is to provide natural namespacing for the identifier. Hence, the URI itself may not resolve to a valid endpoint, but must use a domain name controlled by the resource owner (the organisation responsible for the OpenActive open data feed).',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_ID,
        },
      },
    };
  }

  validateField(node, field) {
    if (field !== '@id' && field !== 'id') {
      return [];
    }

    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }

    // Don't do this check for models that aren't JSON-LD
    if (!node.model.isJsonLd) {
      return [];
    }

    const errors = [];

    // Get the field object
    const fieldValue = node.getValue(field);

    if (typeof fieldValue !== 'string' || !PropertyHelper.isUrl(fieldValue)) {
      errors.push(
        this.createError(
          'idInvalid',
          {
            fieldValue,
            path: node.getPath(field),
          },
        ),
      );
    } else {
      return [];
    }

    return errors;
  }
};
