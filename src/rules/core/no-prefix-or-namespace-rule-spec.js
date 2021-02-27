const NoPrefixOrNamespaceRule = require('./no-prefix-or-namespace-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const OptionsHelper = require('../../helpers/options');

describe('NoPrefixOrNamespaceRule', () => {
  const model = new Model({
    type: 'Event',
    hasId: true,
    idFormat: 'https://schema.org/URL',
    inSpec: [
      '@context',
      'id',
      'type',
      'name',
      'ageRange',
    ],
  }, 'latest');
  model.hasSpecification = true;

  const rule = new NoPrefixOrNamespaceRule();

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if all fields are non-prefixed', async () => {
    const data = {
      '@type': 'Event',
      name: 'An Event',
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

  it('should return no errors if all prefixed or namespaced fields are extensions', async () => {
    const data = {
      '@type': 'Event',
      'ext:testField': 'An extension field',
      'http://ext.example.org/anotherTestField': 'Another extension field',
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

  it('should return an error if type or id are used for BookableRPDEFeed mode', async () => {
    const data = {
      type: 'Event',
      id: 'http://example.org/event/1',
    };

    const options = new OptionsHelper({ validationMode: 'BookableRPDEFeed' });
    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(2);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.USE_FIELD_ALIASES);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return a warning if type or id are used for RPDEFeed mode', async () => {
    const data = {
      type: 'Event',
      id: 'http://example.org/event/1',
    };

    const options = new OptionsHelper({ validationMode: 'RPDEFeed' });
    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(2);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.USE_FIELD_ALIASES);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
  it('should return a warning if prefixed fields with aliases are used', async () => {
    const data = {
      '@type': 'Event',
      '@id': 'http://example.org/event/1',
      'schema:name': 'Event Name',
      'oa:ageRange': {
        '@type': 'QuantitativeValue',
        minValue: 0,
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(2);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.USE_FIELD_ALIASES);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
  it('should return a warning if prefixed field values with aliases are used', async () => {
    const data = {
      '@type': 'skos:Concept',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.USE_FIELD_ALIASES);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
  it('should return a warning if prefixed fields with namespaces are used', async () => {
    const data = {
      '@type': 'Event',
      '@id': 'http://example.org/event/1',
      'https://schema.org/name': 'Event Name',
      'https://openactive.io/ageRange': {
        '@type': 'QuantitativeValue',
        minValue: 0,
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(2);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.USE_FIELD_ALIASES);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
  it('should return a warning if prefixed field values with namespaces are used', async () => {
    const data = {
      '@type': 'https://schema.org/Event',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.USE_FIELD_ALIASES);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
