const ValidModelTypeRule = require('./valid-model-type-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ValidModelTypeRule', () => {
  let model;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'Event',
      fields: {
        subEvent: {
          model: '#Event',
          alternativeModels: [
            'ArrayOf#Event',
          ],
        },
      },
    }, 'latest');

    rule = new ValidModelTypeRule();
  });

  it('should target models of any type', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if there is a type we recognise', async () => {
    const data = {
      '@type': 'Event',
    };
    model.hasSpecification = true;

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a failure if the type is missing from the model', async () => {
    const data = {};

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return a failure with a type hint if the type is missing from the model and has a parent', async () => {
    const data = {};
    model.hasSpecification = true;

    const parentNode = new ModelNode(
      '$',
      {
        '@type': 'Event',
        subEvent: data,
      },
      null,
      model,
    );

    const nodeToTest = new ModelNode(
      'subEvent',
      data,
      parentNode,
      new Model(),
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      expect(error.message).toBe('Objects in `subEvent` must be of type `Event`. Please amend the property to `"@type": "Event"` in the object to allow for further validation.\n\nFor example:\n\n```\n"subEvent": {\n  "@type": "Event"\n}\n```');
    }
  });

  it('should not throw if the type is missing from the model and has a parent', async () => {
    const data = {
      value: 25,
      unitCode: 'SMI',
    };
    model.hasSpecification = true;

    const parentNode = new ModelNode(
      '$',
      {
        '@type': 'Event',
      },
      null,
      model,
    );

    const nodeToTest = new ModelNode(
      'distance',
      data,
      parentNode,
      new Model(),
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return a tip if the type is present, but we don\'t recognise the model', async () => {
    const data = {
      '@type': 'OutsideSpec',
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
      expect(error.type).toBe(ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.SUGGESTION);
    }
  });
});
