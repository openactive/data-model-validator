

const RecommendedFieldsRule = require('./recommended-fields-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('RecommendedFieldsRule', () => {
  const model = new Model({
    type: 'Event',
    recommendedFields: [
      'description',
      'name',
    ],
  });
  model.hasSpecification = true;

  const rule = new RecommendedFieldsRule();

  it('should target models of any type', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if all recommended fields are present', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
      name: 'Tai chi Class',
      description: 'A class about Tai Chi',
    };

    const errors = rule.validate(data, model, null);

    expect(errors.length).toBe(0);
  });

  it('should return a warning per field if any recommended fields are missing', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
    };

    const errors = rule.validate(data, model, null);

    expect(errors.length).toBe(2);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_RECOMMENDED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
