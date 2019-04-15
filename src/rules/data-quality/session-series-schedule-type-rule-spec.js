const SessionSeriesScheduleTypeRule = require('./session-series-schedule-type-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('SessionSeriesScheduleTypeRule', () => {
  let model;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'SessionSeries',
      inSpec: [
        'eventSchedule',
      ],
    }, 'latest');
    rule = new SessionSeriesScheduleTypeRule();
  });

  it('should target eventSchedule in SessionSeries models', () => {
    let isTargeted = rule.isFieldTargeted(model, 'eventSchedule');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'name');
    expect(isTargeted).toBe(false);
  });

  it('should return no errors if the scheduledEventType of the eventSchedule of the SessionSeries is ScheduledSession', async () => {
    const data = {
      type: 'SessionSeries',
      eventSchedule: [
        {
          type: 'Schedule',
          scheduledEventType: 'ScheduledSession',
        },
      ],
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
  it('should return no errors if the type of the eventSchedule of the SessionSeries is PartialSchedule', async () => {
    const data = {
      type: 'SessionSeries',
      eventSchedule: [
        {
          type: 'PartialSchedule',
        },
      ],
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

  it('should return no errors if the eventSchedule of the SessionSeries is not set', async () => {
    const data = {
      type: 'SessionSeries',
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

  it('should return a failure if the scheduledEventType of the eventSchedule of the SessionSeries is not ScheduledSession', async () => {
    const data = {
      type: 'SessionSeries',
      eventSchedule: [
        {
          type: 'Schedule',
          scheduledEventType: 'Event',
        },
      ],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validateAsync(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
