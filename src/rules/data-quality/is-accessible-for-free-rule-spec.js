const IsAccessibleForFreeRule = require('./is-accessible-for-free-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('IsAccessibleForFreeRule', () => {
  const rule = new IsAccessibleForFreeRule();

  const model = new Model({
    type: 'Event',
    fields: {
      isAccessibleForFree: {
        fieldName: 'isAccessibleForFree',
        requiredType: 'http://schema.org/Boolean',
      },
      offers: {
        fieldName: 'offers',
        requiredType: 'ArrayOf#Offer',
      },
      superEvent: {
        fieldName: 'superEvent',
        requiredType: '#Event',
        inheritsFrom: {
          exclude: ['superEvent'],
        },
      },
    },
  });
  model.hasSpecification = true;

  it('should target Event models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  // No error
  it('should return no error when isAccessibleForFree is set to true with a zero offer', () => {
    const data = {
      type: 'Event',
      offers: [{
        type: 'Offer',
        id: 'http://example.org/offer/1',
        name: 'Free Offer',
        price: 0.00,
        priceCurrency: 'GBP',
      }],
      isAccessibleForFree: true,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no error when isAccessibleForFree is set to true with a zero offer in a namespaced field', () => {
    const data = {
      type: 'Event',
      'schema:offers': [{
        type: 'Offer',
        id: 'http://example.org/offer/1',
        name: 'Free Offer',
        price: 0.00,
        priceCurrency: 'GBP',
      }],
      'schema:isAccessibleForFree': true,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no error when isAccessibleForFree is set to false with no zero offer', () => {
    const data = {
      type: 'Event',
      offers: [{
        type: 'Offer',
        id: 'http://example.org/offer/1',
        name: 'Unfree Offer',
        price: 10.00,
        priceCurrency: 'GBP',
      }],
      isAccessibleForFree: false,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no error when isAccessibleForFree is not set with no zero offer', () => {
    const data = {
      type: 'Event',
      offers: [{
        type: 'Offer',
        id: 'http://example.org/offer/1',
        name: 'Unfree Offer',
        price: 10.00,
        priceCurrency: 'GBP',
      }],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });

  it('should return no error when isAccessibleForFree is set to true with a parent zero offer', () => {
    const data = {
      type: 'Event',
      superEvent: {
        type: 'Event',
        offers: [{
          type: 'Offer',
          id: 'http://example.org/offer/1',
          name: 'Free Offer',
          price: 0.00,
          priceCurrency: 'GBP',
        }],
      },
      isAccessibleForFree: true,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no error when isAccessibleForFree is set to false with no parent zero offer', () => {
    const data = {
      type: 'Event',
      superEvent: {
        type: 'Event',
        offers: [{
          type: 'Offer',
          id: 'http://example.org/offer/1',
          name: 'Unfree Offer',
          price: 10.00,
          priceCurrency: 'GBP',
        }],
      },
      isAccessibleForFree: false,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return no error when isAccessibleForFree is not set with no parent zero offer', () => {
    const data = {
      type: 'Event',
      superEvent: {
        type: 'Event',
        offers: [{
          type: 'Offer',
          id: 'http://example.org/offer/1',
          name: 'Unfree Offer',
          price: 10.00,
          priceCurrency: 'GBP',
        }],
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });

  // Error
  it('should return an error when isAccessibleForFree is set to false with a zero offer', () => {
    const data = {
      type: 'Event',
      offers: [{
        type: 'Offer',
        id: 'http://example.org/offer/1',
        name: 'Free Offer',
        price: 0.00,
        priceCurrency: 'GBP',
      }],
      isAccessibleForFree: false,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.MISSING_IS_ACCESSIBLE_FOR_FREE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });
  it('should return an error when isAccessibleForFree is not set with a zero offer', () => {
    const data = {
      type: 'Event',
      offers: [{
        type: 'Offer',
        id: 'http://example.org/offer/1',
        name: 'Free Offer',
        price: 0.00,
        priceCurrency: 'GBP',
      }],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.MISSING_IS_ACCESSIBLE_FOR_FREE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });

  it('should return no error when isAccessibleForFree is set to false with a parent zero offer', () => {
    const data = {
      type: 'Event',
      superEvent: {
        type: 'Event',
        offers: [{
          type: 'Offer',
          id: 'http://example.org/offer/1',
          name: 'Free Offer',
          price: 0.00,
          priceCurrency: 'GBP',
        }],
      },
      isAccessibleForFree: false,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.MISSING_IS_ACCESSIBLE_FOR_FREE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });
  it('should return no error when isAccessibleForFree is not set with a parent zero offer', () => {
    const data = {
      type: 'Event',
      superEvent: {
        type: 'Event',
        offers: [{
          type: 'Offer',
          id: 'http://example.org/offer/1',
          name: 'Free Offer',
          price: 0.00,
          priceCurrency: 'GBP',
        }],
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.MISSING_IS_ACCESSIBLE_FOR_FREE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });
});
