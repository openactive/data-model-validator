const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ConceptIdInSchemeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Concept: ['id', 'inScheme'] };
    this.meta = {
      name: 'ConceptIdInSchemeRule',
      description: 'Validates that both id and inScheme are set on Concept if one of them is set.',
      tests: {
        default: {
          message: 'If one of "id" or "inScheme" are set on a Concept, the other should be set too.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.CONCEPT_ID_AND_IN_SCHEME_TOGETHER,
        },
      },
    };
  }

  validateField(node, field) {
    const prop = PropertyHelper.getFullyQualifiedProperty(field);
    const otherField = prop.alias === 'id' ? 'inScheme' : 'id';
    const errors = [];

    if (!PropertyHelper.objectHasField(node.value, otherField)) {
      errors.push(
        this.createError(
          'default',
          {
            value: node.value[field],
            path: `${node.getPath()}.${field}`,
          },
          {
            field,
            model: node.model.type,
          },
        ),
      );
    }

    return errors;
  }
};
