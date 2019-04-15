const AssumeEventStatusRule = require('./assume-event-status-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('AssumeEventStatusRule', () => {
  const model = new Model({
    type: 'Event',
    inSpec: [
      'eventStatus',
      'type',
    ],
    fields: {
      eventStatus: {
        fieldName: 'eventStatus',
        requiredType: 'https://schema.org/URL',
        options: [
          'https://schema.org/EventCancelled',
          'https://schema.org/EventPostponed',
          'https://schema.org/EventRescheduled',
          'https://schema.org/EventScheduled',
        ],
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  const rule = new AssumeEventStatusRule();

  it('should target the Event model', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the eventStatus fields are valid', async () => {
    const data = {
      type: 'Event',
      eventStatus: 'https://schema.org/EventPostponed',
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

  it('should return no errors if the eventStatus fields are valid', async () => {
    const data = {
      type: 'Event',
      'schema:eventStatus': 'https://schema.org/EventPostponed',
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

  it('should return a notice if the eventStatus field is not set', async () => {
    const data = {
      type: 'Event',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validateAsync(nodeToTest);

    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.CONSUMER_ASSUME_EVENT_STATUS);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.SUGGESTION);
  });

  it('should return a notice if the eventStatus field is not valid', async () => {
    const data = {
      type: 'Event',
      eventStatus: 'https://openactive.io/EventStatus',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validateAsync(nodeToTest);

    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.CONSUMER_ASSUME_EVENT_STATUS);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.SUGGESTION);
  });
});
