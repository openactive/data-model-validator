const ScheduleEventTypeIsEventSubclass = require('./scheduleeventype-is-valid-event-subclass-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ScheduleEventTypeIsEventSubclass', () => {
  let rule;

  beforeEach(() => {
    rule = new ScheduleEventTypeIsEventSubclass();
  });

  it('should target models of any type', () => {
    const model = new Model({
      type: 'Schedule',
    }, 'latest');

    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if scheduleEventType is a subClass of Event', async () => {
    const model = new Model({
      type: 'Schedule',
      subClassGraph: ['#Event'],
    }, 'latest');

    const data = {
      scheduledEventType: 'ScheduledSession',
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

  it('should return errors if scheduleEventType is not a subClass of Event', async () => {
    const model = new Model({
      type: 'Schedule',
      subClassGraph: ['#Event'],
    }, 'latest');

    const data = {
      scheduledEventType: 'Place',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.INVALID_SCHEDULE_EVENT_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return errors if scheduleEventType does not have a valid model', async () => {
    const model = new Model({
      type: 'Schedule',
      subClassGraph: ['#Event'],
    }, 'latest');

    const data = {
      scheduledEventType: 'Banana',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.INVALID_SCHEDULE_EVENT_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return errors if scheduleEventType does not have a subClassGraph', async () => {
    const model = new Model({
      type: 'Schedule',
      subClassGraph: ['#Event'],
    }, 'latest');

    const data = {
      scheduledEventType: 'DownloadData',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);
    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.INVALID_SCHEDULE_EVENT_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
