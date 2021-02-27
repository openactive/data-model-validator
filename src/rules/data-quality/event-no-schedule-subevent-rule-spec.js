const EventNoScheduleSubeventRule = require('./event-no-schedule-subevent-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('EventNoScheduleSubeventRule', () => {
  let model;
  let subModel;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'Event',
      inSpec: [
        'eventSchedule',
        'subEvent',
      ],
    }, 'latest');
    subModel = new Model({
      type: 'SessionSeries',
      subClassGraph: ['#Event'],
      inSpec: [
        'eventSchedule',
        'subEvent',
      ],
    }, 'latest');
    rule = new EventNoScheduleSubeventRule();
  });

  it('should target Event models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if there is no subEvent or eventSchedule set on the Event', async () => {
    const data = {
      '@type': 'Event',
      name: 'Test Event',

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

  it('should return no errors if there is an subEvent or eventSchedule set on a subclass of Event', async () => {
    const data = {
      '@type': 'SessionSeries',
      name: 'Test Event',
      subEvent: [
        {
          '@type': 'Event',
        },
      ],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      subModel,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a warning if eventSchedule or subEvent is set on the Event', async () => {
    const dataItems = [
      {
        '@type': 'Event',
        eventSchedule: {
          instanceType: 'Event',
        },
      },
      {
        '@type': 'Event',
        subEvent: [
          {
            '@type': 'Event',
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
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.INVALID_TYPE);
        expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
      }
    }
  });
});
