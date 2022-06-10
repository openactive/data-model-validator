const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const OptionsHelper = require('../../helpers/options');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const NoIdReferencesForResponsesRule = require('./no-id-references-for-responses-rule');


describe('NoIdReferencesForResponsesRule', () => {
  const rule = new NoIdReferencesForResponsesRule();

  const model = new Model({
    type: 'OrderItem',
  }, 'latest');
  model.hasSpecification = true;

  it('should return a failure if a response object does not have `acceptedOffer` as a data object', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Response' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
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
    expect(errors[0].type).toBe(ValidationErrorType.FIELD_SHOUlD_NOT_BE_ID_REFERENCE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
  it('should return a failure if a response object does not have `orderedItem` as a data object', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Response' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      orderedItem: 'https://example.com/session/1',
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
    expect(errors[0].type).toBe(ValidationErrorType.FIELD_SHOUlD_NOT_BE_ID_REFERENCE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
  it('should return no errors if a request object has `acceptedOffer` as a compact ID reference', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
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
  it('should return no errors if a request object has `orderedItem` as a compact ID reference', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      orderedItem: 'https://example.com/session/1',
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
