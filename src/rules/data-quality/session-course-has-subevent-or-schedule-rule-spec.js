const SessionCourseHasSubeventOrScheduleRule = require('./session-course-has-subevent-or-schedule-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('SessionCourseHasSubeventOrScheduleRule', () => {
  let models;
  let rule;

  beforeEach(() => {
    models = {
      CourseInstance: new Model({
        type: 'CourseInstance',
        inSpec: [
          'eventSchedule',
          'subEvent',
        ],
      }, 'latest'),
      SessionSeries: new Model({
        type: 'SessionSeries',
        inSpec: [
          'eventSchedule',
          'subEvent',
        ],
      }, 'latest'),
    };
    rule = new SessionCourseHasSubeventOrScheduleRule();
  });

  it('should target CourseInstance and SessionSeries models', () => {
    let isTargeted = rule.isModelTargeted(models.CourseInstance);
    expect(isTargeted).toBe(true);

    isTargeted = rule.isModelTargeted(models.SessionSeries);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the eventSchedule or the subEvent of the event is set', async () => {
    const dataItems = [
      {
        type: 'SessionSeries',
        eventSchedule: {
          type: 'Schedule',
        },
      },
      {
        type: 'SessionSeries',
        subEvent: [
          {
            type: 'Event',
          },
        ],
      },
      {
        type: 'CourseInstance',
        eventSchedule: {
          type: 'Schedule',
        },
      },
      {
        type: 'CourseInstance',
        subEvent: [
          {
            type: 'Event',
          },
        ],
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        models[data.type],
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    }
  });

  it('should return a failure if the eventSchedule and the subEvent of the event is not set', async () => {
    const dataItems = [
      {
        type: 'CourseInstance',
      },
      {
        type: 'SessionSeries',
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        models[data.type],
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);
      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });

  it('should return a failure if the event\'s eventSchedule is not set and it\'s subEvent is an empty array', async () => {
    const dataItems = [
      {
        type: 'CourseInstance',
        subEvent: [],
      },
      {
        type: 'SessionSeries',
        subEvent: [],
      },
    ];

    for (const data of dataItems) {
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        models[data.type],
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);
      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
        expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    }
  });
});
