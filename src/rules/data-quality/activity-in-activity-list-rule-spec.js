const ActivityInActivityListRule = require('./activity-in-activity-list-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const OptionsHelper = require('../../helpers/options');
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

  const activityLists = [
    {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      '@id': 'http://openactive.io/activity-list/',
      title: 'OpenActive Activity List',
      description: 'This document describes the OpenActive standard activity list.',
      type: 'skos:ConceptScheme',
      license: 'https://creativecommons.org/licenses/by/4.0/',
      concepts: [
        {
          id: 'http://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a1',
          type: 'skos:Concept',
          prefLabel: 'Flag Football',
          'skos:definition': 'Flag is the fastest growing format of the game in Great Britain, encompassing schools, colleges, universities and in the community.',
          brodaer: 'http://openactive.io/activity-list/#9caeb442-2834-4859-b660-9172ed61ee71',
        },
        {
          id: 'http://openactive.io/activity-list/#0a5f732d-e806-4e51-ad40-0a7de0239c8c',
          type: 'skos:Concept',
          prefLabel: 'Football',
          'skos:definition': 'Football is widely considered to be the most popular sport in the world. The beautiful game is England\'s national sport',
          topConceptOf: 'http://openactive.io/activity-list/',
        },
      ],
    },
  ];

  const options = new OptionsHelper({
    activityLists,
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
        'skos:prefLabel': 'flag football',
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
        options,
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
        options,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
