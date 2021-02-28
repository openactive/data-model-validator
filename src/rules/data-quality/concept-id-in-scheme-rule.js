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
          description: 'Validates that both id and inScheme are set on Concept if one of them is set.',
          message: 'When using a controlled vocabulary via `inScheme`, `id` must also be included to reference the Concept in the controlled vocabulary.\n\n`id` must not be set without reference to a controlled vocabulary.\n\nYou can fix this by supplying a `{{field}}`.',
          sampleValues: {
            field: 'inScheme',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.CONCEPT_ID_AND_IN_SCHEME_TOGETHER,
        },
        activity: {
          description: 'Validates that both id and inScheme are set on Concept if one of them is set in an activity list.',
          message: 'When using an activity list via `inScheme`, `id` must also be included to reference the Concept in the activity list.\n\n`id` must not be set without reference to an activity list.\n\nAn example reference to an activity list is below:\n\n```\n"activity": [\n  {\n    "@type": "Concept",\n    "id": "https://openactive.io/activity-list#72ddb2dc-7d75-424e-880a-d90eabe91381",\n    "inScheme": "https://openactive.io/activity-list",\n    "prefLabel": "Running"\n  }\n]\n```',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.CONCEPT_ID_AND_IN_SCHEME_TOGETHER,
        },
      },
    };
  }

  validateField(node, field) {
    const prop = PropertyHelper.getFullyQualifiedProperty(field, node.options.version);
    const otherField = prop.alias === 'id' ? 'inScheme' : 'id';
    const errors = [];

    if (!node.hasMappedField(otherField)) {
      errors.push(
        this.createError(
          node.name === 'activity' ? 'activity' : 'default',
          {
            value: node.getValue(field),
            path: node.getPath(field),
          },
          {
            field: otherField,
          },
        ),
      );
    }

    return errors;
  }
};
