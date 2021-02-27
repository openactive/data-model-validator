const AssumeNoGenderRestrictionRule = require('./assume-no-gender-restriction-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('AssumeNoGenderRestrictionRule', () => {
  const model = new Model({
    type: 'Event',
    inSpec: [
      'genderRestriction',
      'type',
    ],
    fields: {
      genderRestriction: {
        fieldName: 'genderRestriction',
        requiredType: 'https://schema.org/URL',
        options: [
          'https://openactive.io/Female',
          'https://openactive.io/Male',
          'https://openactive.io/None',
        ],
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  const rule = new AssumeNoGenderRestrictionRule();

  it('should target the Event model', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the genderRestriction fields are valid', async () => {
    const data = {
      '@type': 'Event',
      genderRestriction: 'https://openactive.io/Female',
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

  it('should return no errors if the genderRestriction fields are valid', async () => {
    const data = {
      '@type': 'Event',
      'oa:genderRestriction': 'https://openactive.io/Female',
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

  it('should return a notice if the genderRestriction field is not set', async () => {
    const data = {
      '@type': 'Event',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.CONSUMER_ASSUME_NO_GENDER_RESTRICTION);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.SUGGESTION);
  });

  it('should return a notice if the genderRestriction field is not valid', async () => {
    const data = {
      '@type': 'Event',
      genderRestriction: 'https://openactive.io/Invalid',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.CONSUMER_ASSUME_NO_GENDER_RESTRICTION);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.SUGGESTION);
  });
});
