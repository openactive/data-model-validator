const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const { IdReferencesForRequestsRule } = require('./id-references-for-requests-rule');
const OptionsHelper = require('../../helpers/options');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');


describe('IdReferencesForRequestsRule', () => {
  const rule = new IdReferencesForRequestsRule();

  const model = new Model({
    type: 'OrderItem',
    referencedFields: [
      'orderedItem',
      'acceptedOffer',
    ],
  }, 'latest');
  model.hasSpecification = true;

  it('should return a failure if a request object does not have `acceptedOffer` as a compact ID reference', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      acceptedOffer: {
        '@type': 'Offer',
        '@id': 'https://example.com/offer/1',
      },
      orderedItem: 'https://example.com/item/2',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_ID_REFERENCE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
  it('should return a failure if a request object does not have `orderedItem` as a compact ID reference', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      orderedItem: {
        '@type': 'ScheduledSession',
        '@id': 'https://example.com/session/1',
      },
      acceptedOffer: 'https://example.com/offer/1',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_ID_REFERENCE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
  it('should return no errors if a response object has `acceptedOffer` as a data object', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Response' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      acceptedOffer: {
        '@type': 'ScheduledSession',
        '@id': 'https://example.com/offer/1',
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no errors if a response object has `orderedItem` as a data object', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Response' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      orderedItem: {
        '@type': 'ScheduledSession',
        '@id': 'https://example.com/session/1',
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no errors if a request object has `orderedItem` as a compact ID reference', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      orderedItem: 'https://example.com/session/1',
      acceptedOffer: 'https://example.com/offer/1',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
});
