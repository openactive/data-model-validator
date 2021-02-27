const BookingRootTypeCorrectRule = require('./booking-root-type-correct-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const OptionsHelper = require('../../helpers/options');

describe('BookingRootTypeCorrectRule', () => {
  let rule;

  beforeEach(() => {
    rule = new BookingRootTypeCorrectRule();
  });

  it('should target models of any type', () => {
    const model = new Model({
      type: 'Event',
      inSpec: [
        '@context',
      ],
    }, 'latest');

    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the correct type is in the root node', async () => {
    const dataItems = [
      {
        validationMode: 'C1Response',
        data: {
          '@type': 'OrderQuote',
        },
        model: new Model({
          type: 'OrderQuote',
        }, 'latest'),
      },
      {
        validationMode: 'BResponse',
        data: {
          '@type': 'Order',
        },
        model: new Model({
          type: 'Order',
        }, 'latest'),
      },
      {
        validationMode: 'OrdersFeed',
        data: {
          '@type': 'Order',
        },
        model: new Model({
          type: 'Order',
        }, 'latest'),
      },
      {
        validationMode: 'OrderStatus',
        data: {
          '@type': 'Order',
        },
        model: new Model({
          type: 'Order',
        }, 'latest'),
      },
    ];

    for (const dataItem of dataItems) {
      const options = new OptionsHelper({ validationMode: dataItem.validationMode });
      const nodeToTest = new ModelNode(
        '$',
        dataItem.data,
        null,
        dataItem.model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    }
  });

  it('should return an error if the root node is not the correct type', async () => {
    const dataItems = [
      {
        validationMode: 'C1Response',
        data: {
          '@type': 'Order',
        },
        model: new Model({
          type: 'Order',
        }, 'latest'),
      },
      {
        validationMode: 'BResponse',
        data: {
          '@type': 'OrderQuote',
        },
        model: new Model({
          type: 'OrderQuote',
        }, 'latest'),
      },
      {
        validationMode: 'OrdersFeed',
        data: {
          '@type': 'OrderQuote',
        },
        model: new Model({
          type: 'OrderQuote',
        }, 'latest'),
      },
      {
        validationMode: 'OrderStatus',
        data: {
          '@type': 'Event',
        },
        model: new Model({
          type: 'Event',
        }, 'latest'),
      },
    ];

    for (const dataItem of dataItems) {
      const options = new OptionsHelper({ validationMode: dataItem.validationMode });
      const nodeToTest = new ModelNode(
        '$',
        dataItem.data,
        null,
        dataItem.model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.WRONG_BASE_TYPE);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });
});
