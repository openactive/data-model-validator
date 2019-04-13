const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ConceptNoPropsIfInSchemeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Concept: ['broader', 'narrower', 'definition', 'related'] };
    this.meta = {
      name: 'ConceptNoPropsIfInSchemeRule',
      description: 'Validates that broader, narrower, definition and related aren\'t defined if inScheme is set on Concept.',
      tests: {
        default: {
          message: 'When using a controlled vocabulary via `inScheme`, `{{field}}` does not need to be specified inline. To fix this, define it in `"{{inScheme}}"` instead and remove from your JSON.',
          sampleValues: {
            inScheme: 'https://openactive.io/activity-list',
            field: 'broader',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.CONCEPT_NO_NON_CORE_PROPS,
        },
      },
    };
  }

  validateFieldSync(node, field) {
    const errors = [];
    if (node.hasMappedField('inScheme')) {
      errors.push(
        this.createError(
          'default',
          {
            value: node.getValue(field),
            path: node.getPath(field),
          },
          {
            field,
            inScheme: node.getValue('inScheme'),
          },
        ),
      );
    }

    return errors;
  }
};
