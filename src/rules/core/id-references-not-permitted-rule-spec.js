const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const OptionsHelper = require('../../helpers/options');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const IdReferencesNotPermittedRule = require('./id-references-not-permitted-rule');


describe('IdReferencesNotPermittedRule', () => {
  const rule = new IdReferencesNotPermittedRule();

  const model = new Model({
    type: 'OrderItem',
    validationMode: {
      C1Request: 'request',
      C1Response: 'Cresponse',
    },
    imperativeConfiguration: {
      request: {
        requiredFields: [
          'type',
          'acceptedOffer',
          'orderedItem',
          'position',
        ],
        recommendedFields: [],
        shallNotInclude: [
          'id',
          'orderItemStatus',
          'unitTaxSpecification',
          'accessCode',
          'error',
          'cancellationMessage',
          'customerNotice',
          'orderItemIntakeForm',
        ],
        requiredOptions: [],
        referencedFields: [
          'orderedItem',
          'acceptedOffer',
        ],
      },
      Cresponse: {
        requiredFields: [
          'type',
          'acceptedOffer',
          'orderedItem',
          'position',
        ],
        shallNotInclude: [
          'id',
          'orderItemStatus',
          'cancellationMessage',
          'customerNotice',
          'accessCode',
          'accessPass',
          'error',
        ],
        requiredOptions: [],
        shallNotBeReferencedFields: [
          'orderedItem',
          'acceptedOffer',
        ],
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  it('should return a failure if a response object does not have `acceptedOffer` as a data object', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Response' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      acceptedOffer: 'https://example.com/offer/1',
      orderedItem: {
        '@id': 'https://example.com/item/1',
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

    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.FIELD_MUST_NOT_BE_ID_REFERENCE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
  it('should return a failure if a response object does not have `orderedItem` as a data object', async () => {
    const options = new OptionsHelper({ validationMode: 'C1Response' });
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'OrderItem',
      orderedItem: 'https://example.com/session/1',
      acceptedOffer: {
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

    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.FIELD_MUST_NOT_BE_ID_REFERENCE);
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
