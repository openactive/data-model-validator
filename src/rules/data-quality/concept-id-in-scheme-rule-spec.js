const ConceptIdInSchemeRule = require('./concept-id-in-scheme-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ConceptIdInSchemeRule', () => {
  const rule = new ConceptIdInSchemeRule();

  const model = new Model({
    type: 'Concept',
    fields: {
      id: {
        fieldName: 'id',
        requiredType: 'https://schema.org/URL',
      },
      inScheme: {
        fieldName: 'inScheme',
        requiredType: 'https://schema.org/URL',
      },
    },
  }, 'latest');

  it('should target id and inScheme in Concept model', () => {
    let isTargeted = rule.isFieldTargeted(model, 'id');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'inScheme');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(false);
  });

  it('should return no error when both id and inScheme are specified', async () => {
    const data = {
      '@type': 'Concept',
      '@id': 'http://example.org/concept/1',
      inScheme: 'http://example.org/scheme/2',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no error when both id and inScheme are specified in a namespaced field', async () => {
    const data = {
      '@type': 'Concept',
      '@id': 'http://example.org/concept/1',
      'skos:inScheme': 'http://example.org/scheme/2',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no error when neither id or inScheme are specified', async () => {
    const data = {
      '@type': 'Concept',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return an error when an id but no inScheme is set', async () => {
    const data = {
      '@type': 'Concept',
      '@id': 'http://example.org/concept/1',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.CONCEPT_ID_AND_IN_SCHEME_TOGETHER);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });
  it('should return an error when an inScheme but no id is set', async () => {
    const data = {
      '@type': 'Concept',
      inScheme: 'http://example.org/scheme/2',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.CONCEPT_ID_AND_IN_SCHEME_TOGETHER);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });
});
