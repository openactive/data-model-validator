const IfNeedsBookingMustHaveValidOfferRule = require('./if-needs-booking-must-have-valid-offer-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('IfNeedsBookingMustHaveValidOfferRule', () => {
  let model;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'Event',
      inSpec: [
        'type',
        'offers',
        'isAccessibleWithoutBooking',
      ],
    }, 'latest');
    rule = new IfNeedsBookingMustHaveValidOfferRule();
  });

  it('should target Event models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the Event has an isAccessibleWithoutBooking of true', async () => {
    const data = {
      type: 'Event',
      isAccessibleWithoutBooking: true,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validateAsync(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return no errors if the Event has an isAccessibleWithoutBooking of false, but has an offer with an id or url', async () => {
    const dataItems = [
      {
        type: 'Event',
        isAccessibleWithoutBooking: false,
        offers: [
          {
            type: 'Offer',
            id: 'https://example.org/offer/1',
          },
        ],
      },
      {
        type: 'Event',
        isAccessibleWithoutBooking: true,
        offers: [
          {
            type: 'Offer',
            url: 'https://example.org/offer/1',
          },
        ],
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

  it('should return an error if the Event as an isAccessibleWithoutBooking of false, and no offer with an id or url', async () => {
    const dataItems = [
      {
        type: 'Event',
        isAccessibleWithoutBooking: false,
      },
      {
        type: 'Event',
        isAccessibleWithoutBooking: false,
        offers: [],
      },
      {
        type: 'Event',
        isAccessibleWithoutBooking: false,
        offers: [
          {
            type: 'Offer',
          },
        ],
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
        expect(error.type).toBe(ValidationErrorType.EVENT_REQUIRING_BOOKING_MUST_HAVE_VALID_OFFER);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });
});
