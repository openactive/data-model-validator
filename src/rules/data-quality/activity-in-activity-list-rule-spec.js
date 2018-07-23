const ActivityInActivityListRule = require('./activity-in-activity-list-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ActivityInActivityListRule', () => {
  const rule = new ActivityInActivityListRule();

  const model = new Model({
    type: 'Event',
    fields: {
      duration: {
        fieldName: 'activity',
        model: 'ArrayOf#Concept',
        alternativeTypes: [
          'ArrayOf#http://schema.org/Text',
        ],
      },
    },
  });

  it('should target activity field in Event models', () => {
    const isTargeted = rule.isFieldTargeted(model, 'activity');
    expect(isTargeted).toBe(true);
  });

  it('should return no error when an activity in the list is supplied', () => {
    const data = {
      type: 'Event',
    };

    const activities = [
      'Football',
      {
        id: 'http://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a1',
        prefLabel: 'flag football',
        type: 'Concept',
      },
    ];

    for (const activity of activities) {
      data.activity = [activity];
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error when an activity not in the list is supplied', () => {
    const data = {
      type: 'Event',
    };

    const activities = [
      'Secret Football',
      {
        id: 'http://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a3',
        prefLabel: 'Not Real Football',
        type: 'Concept',
      },
    ];

    for (const activity of activities) {
      data.activity = [activity];
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
