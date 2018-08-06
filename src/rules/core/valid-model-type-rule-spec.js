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
    });

    rule = new ValidModelTypeRule();
  });

  it('should target models of any type', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if there is a type we recognise', () => {
    const data = {
      type: 'Event',
    };
    model.hasSpecification = true;

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a failure if the type is missing from the model', () => {
    const data = {};

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
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });

  it('should return a failure with a type hint if the type is missing from the model and has a parent', () => {
    const data = {};
    model.hasSpecification = true;

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
      new Model(),
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
      expect(error.message).toBe('Objects in "subEvent" must be of type "Event". Please add "type": "Event" to this object to allow for further validation.');
    }
  });

  it('should not throw if the type is missing from the model and has a parent', () => {
    const data = {
      value: 25,
      unitCode: 'SMI',
    };
    model.hasSpecification = true;

    const parentNode = new ModelNode(
      '$',
      {
        type: 'Event',
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
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });

  it('should return a tip if the type is present, but we don\'t recognise the model', () => {
    const data = {
      type: 'OutsideSpec',
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
      expect(error.type).toBe(ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.SUGGESTION);
    }
  });
});
