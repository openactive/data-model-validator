const DataModelHelper = require('../../helpers/data-model');
const OpenactiveUrlsCorrectRule = require('./openactive-urls-correct-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('OpenactiveUrlsCorrectRule', () => {
  let model;
  let rule;
  let metaData;

  beforeEach(() => {
    model = new Model({
      type: 'Event',
      inSpec: [
        '@context',
      ],
    }, 'latest');
    metaData = DataModelHelper.getMetaData('latest');
    rule = new OpenactiveUrlsCorrectRule();
  });

  it('should target models of any type', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the context URL starts with https://openactive.io', async () => {
    const dataItems = [
      {
        '@context': metaData.contextUrl,
        '@type': 'Event',
      },
      {
        '@context': [metaData.contextUrl],
        '@type': 'Event',
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

      expect(errors.length).toBe(0);
    }
  });

  it('should return no error if the context does not have OpenActive namespace in it', async () => {
    const dataItems = [
      {
        '@context': 'https://example.org/ns',
        '@type': 'Event',
      },
      {
        '@context': ['https://example.org/ns'],
        '@type': 'Event',
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

      expect(errors.length).toBe(0);
    }
  });

  it('should return no errors if the context array contains non-string entries', async () => {
    // JSON-LD permits an @context array to combine IRIs with inline context
    // definitions. Those entries are not URLs, so this rule has nothing to
    // check and must not throw. ContextInRootNodeRule reports them instead.
    const dataItems = [
      {
        '@context': [metaData.contextUrl, { schema: 'https://schema.org/' }],
        '@type': 'Event',
      },
      {
        '@context': [{ schema: 'https://schema.org/' }],
        '@type': 'Event',
      },
      {
        '@context': [metaData.contextUrl, null],
        '@type': 'Event',
      },
      {
        '@context': [metaData.contextUrl, 42],
        '@type': 'Event',
      },
      {
        '@context': [metaData.contextUrl, ['https://schema.org/']],
        '@type': 'Event',
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

      expect(errors.length).toBe(0);
    }
  });

  it('should still return an error for an incorrect OpenActive URL alongside a non-string entry', async () => {
    const dataItems = [
      {
        '@context': [{ schema: 'https://schema.org/' }, 'http://openactive.io/'],
        '@type': 'Event',
      },
      {
        '@context': ['http://www.openactive.io/', { schema: 'https://schema.org/' }],
        '@type': 'Event',
      },
      {
        '@context': [null, 'https://www.openactive.io/'],
        '@type': 'Event',
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

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.INVALID_FORMAT);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });

  it('should return an error if the context is present, but contains a field not matching the correct scheme / domain', async () => {
    const dataItems = [
      {
        '@context': 'https://www.openactive.io/',
        '@type': 'Event',
      },
      {
        '@context': ['https://www.openactive.io/'],
        '@type': 'Event',
      },
      {
        '@context': 'http://www.openactive.io/',
        '@type': 'Event',
      },
      {
        '@context': ['http://www.openactive.io/'],
        '@type': 'Event',
      },
      {
        '@context': 'http://openactive.io/',
        '@type': 'Event',
      },
      {
        '@context': ['http://openactive.io/'],
        '@type': 'Event',
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

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.INVALID_FORMAT);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });
});
