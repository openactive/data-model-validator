const BookingRootTypeErrorRule = require('./booking-root-type-error-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const OptionsHelper = require('../../helpers/options');

describe('BookingRootTypeErrorRule', () => {
  let rule;

  beforeEach(() => {
    rule = new BookingRootTypeErrorRule();
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
    const model = new Model({
      type: 'UnknownOrderError',
      subClassGraph: ['#OpenBookingError'],
    }, 'latest');

    const data = {
      '@type': 'UnknownOrderError',
    };

    const options = new OptionsHelper({ validationMode: 'OpenBookingError' });
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

  it('should return an error if the root node is not the correct type', async () => {
    const model = new Model({
      type: 'Event',
    }, 'latest');

    const data = {
      '@type': 'Event',
    };

    const options = new OptionsHelper({ validationMode: 'OpenBookingError' });
    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.WRONG_BASE_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return a warning if the root node is of type OpenBookingError', async () => {
    const model = new Model({
      type: 'OpenBookingError',
    }, 'latest');

    const data = {
      '@type': 'OpenBookingError',
    };

    const options = new OptionsHelper({ validationMode: 'OpenBookingError' });
    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.WRONG_BASE_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
