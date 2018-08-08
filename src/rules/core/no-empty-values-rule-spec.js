const NoEmptyValuesRule = require('./no-empty-values-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('NoEmptyValuesRule', () => {
  const model = new Model({
    type: 'Event',
    inSpec: [
      '@context',
      'type',
    ],
  }, 'latest');
  model.hasSpecification = true;

  const rule = new NoEmptyValuesRule();

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if all fields are non-empty', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
      field_value: 'Not empty',
      field_value_array: ['Not empty'],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a failure per field if any fields are null, empty strings or empty arrays', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
      invalid_field: '',
      another_invalid_field: null,
      invalid_field_array: [],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(3);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.FIELD_IS_EMPTY);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
