const ConceptNoPropsIfInSchemeRule = require('./concept-no-props-if-inscheme-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ConceptNoPropsIfInSchemeRule', () => {
  const rule = new ConceptNoPropsIfInSchemeRule();

  const model = new Model({
    type: 'Concept',
    derivedFrom: 'http://www.w3.org/2004/02/skos/core#Concept',
    fields: {
      inScheme: {
        fieldName: 'inScheme',
        requiredType: 'https://schema.org/URL',
      },
      broader: {
        fieldName: 'broader',
        requiredType: 'ArrayOf#https://schema.org/URL',
      },
      narrower: {
        fieldName: 'narrower',
        requiredType: 'ArrayOf#https://schema.org/URL',
      },
    },
  }, 'latest');

  it('should target broader and narrower in Concept model', () => {
    let isTargeted = rule.isFieldTargeted(model, 'broader');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'narrower');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'inScheme');
    expect(isTargeted).toBe(false);
  });

  it('should return no error when inScheme is not specified', async () => {
    const data = {
      '@type': 'Concept',
      broader: ['http://example.org/concept/1'],
      narrower: ['http://example.org/scheme/2'],
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
  it('should return no error when both inScheme is specified in a namespaced field', async () => {
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
  it('should return no error when neither broader or narrower are specified', async () => {
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
    expect(errors.length).toBe(0);
  });
  it('should return an error when an broader or narrower are set but inScheme is', async () => {
    const dataItems = [
      {
        type: 'Concept',
        inScheme: 'http://example.org/scheme/2',
        broader: ['http://example.org/concept/1'],
      },
      {
        type: 'Concept',
        inScheme: 'http://example.org/scheme/2',
        narrower: ['http://example.org/concept/1'],
      },
      {
        type: 'skos:Concept',
        'skos:inScheme': 'http://example.org/scheme/2',
        'skos:broader': ['http://example.org/concept/1'],
      },
      {
        type: 'skos:Concept',
        'skos:inScheme': 'http://example.org/scheme/2',
        'skos:narrower': ['http://example.org/concept/1'],
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.CONCEPT_NO_NON_CORE_PROPS);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
