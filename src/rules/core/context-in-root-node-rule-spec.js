const { contextUrl } = require('openactive-data-models');
const ContextInRootNodeRule = require('./context-in-root-node-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ContextInRootNodeRule', () => {
  let model;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'Event',
      inSpec: [
        '@context',
      ],
    });

    rule = new ContextInRootNodeRule();
  });

  it('should target models of any type', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the correct context is in the root node', () => {
    const dataItems = [
      {
        '@context': contextUrl,
        type: 'Event',
      },
      {
        '@context': [contextUrl],
        type: 'Event',
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    }
  });

  it('should return a failure if the context is missing from the root node', () => {
    const data = {
      type: 'Event',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return no error if the context is missing and this isn\'t the root node', () => {
    const data = {
      type: 'Event',
    };

    const parentNode = new ModelNode(
      '$',
      {
        type: 'Event',
        subEvent: data,
      },
      null,
      model,
    );

    const nodeToTest = new ModelNode(
      'subEvent',
      data,
      parentNode,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a error if the context is present and this isn\'t the root node', () => {
    const data = {
      '@context': contextUrl,
      type: 'Event',
    };

    const parentNode = new ModelNode(
      '$',
      {
        type: 'Event',
        subEvent: data,
      },
      null,
      model,
    );

    const nodeToTest = new ModelNode(
      'subEvent',
      data,
      parentNode,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.FIELD_NOT_IN_SPEC);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return an error if the context is present, but does not have Open Active namespace as the first element', () => {
    const dataItems = [
      {
        '@context': 'https://example.org/ns',
        type: 'Event',
      },
      {
        '@context': ['https://example.org/ns', contextUrl],
        type: 'Event',
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);

      expect(errors.length).toBe(1);

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });

  it('should return no error if the context is present, but contains non-url fields if the model declares its own type', () => {
    const data = {
      '@context': [contextUrl, {}],
      type: 'Event',
    };

    const localModel = new Model({
      type: 'Event',
      inSpec: [
        '@context',
      ],
      fields: {
        '@context': {
          requiredType: 'ArrayOf#http://schema.org/url',
        },
      },
    });

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      localModel,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return an error if the context is present, but contains non-url fields', () => {
    const data = {
      '@context': [contextUrl, {}],
      type: 'Event',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
