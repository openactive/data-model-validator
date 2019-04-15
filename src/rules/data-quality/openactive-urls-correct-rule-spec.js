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
        type: 'Event',
      },
      {
        '@context': [metaData.contextUrl],
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
      const errors = await rule.validateAsync(nodeToTest);

      expect(errors.length).toBe(0);
    }
  });

  it('should return no error if the context does not have OpenActive namespace in it', async () => {
    const dataItems = [
      {
        '@context': 'https://example.org/ns',
        type: 'Event',
      },
      {
        '@context': ['https://example.org/ns'],
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
      const errors = await rule.validateAsync(nodeToTest);

      expect(errors.length).toBe(0);
    }
  });

  it('should return an error if the context is present, but contains a field not matching the correct scheme / domain', async () => {
    const dataItems = [
      {
        '@context': 'https://www.openactive.io/ns/oa.jsonld',
        type: 'Event',
      },
      {
        '@context': ['https://www.openactive.io/ns/oa.jsonld'],
        type: 'Event',
      },
      {
        '@context': 'http://www.openactive.io/ns/oa.jsonld',
        type: 'Event',
      },
      {
        '@context': ['http://www.openactive.io/ns/oa.jsonld'],
        type: 'Event',
      },
      {
        '@context': 'http://openactive.io/ns/oa.jsonld',
        type: 'Event',
      },
      {
        '@context': ['http://openactive.io/ns/oa.jsonld'],
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
      const errors = await rule.validateAsync(nodeToTest);

      expect(errors.length).toBe(1);

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.INVALID_FORMAT);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });
});
