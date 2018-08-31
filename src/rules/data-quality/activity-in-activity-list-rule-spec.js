const ActivityInActivityListRule = require('./activity-in-activity-list-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const OptionsHelper = require('../../helpers/options');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const JsonLoaderHelper = require('../../helpers/json-loader');

describe('ActivityInActivityListRule', () => {
  const rule = new ActivityInActivityListRule();

  const model = new Model({
    type: 'Event',
    fields: {
      duration: {
        fieldName: 'activity',
        model: 'ArrayOf#Concept',
        alternativeTypes: [
          'ArrayOf#https://schema.org/Text',
        ],
      },
    },
  }, 'latest');

  const activityList = {
    '@context': 'https://openactive.io/',
    '@id': 'https://openactive.io/activity-list',
    title: 'OpenActive Activity List',
    description: 'This document describes the OpenActive standard activity list.',
    type: 'skos:ConceptScheme',
    license: 'https://creativecommons.org/licenses/by/4.0/',
    concepts: [
      {
        id: 'https://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a1',
        type: 'skos:Concept',
        prefLabel: 'Flag Football',
        'skos:definition': 'Flag is the fastest growing format of the game in Great Britain, encompassing schools, colleges, universities and in the community.',
        brodaer: 'https://openactive.io/activity-list/#9caeb442-2834-4859-b660-9172ed61ee71',
      },
      {
        id: 'https://openactive.io/activity-list/#0a5f732d-e806-4e51-ad40-0a7de0239c8c',
        type: 'skos:Concept',
        prefLabel: 'Football',
        'skos:definition': 'Football is widely considered to be the most popular sport in the world. The beautiful game is England\'s national sport',
        topConceptOf: 'https://openactive.io/activity-list',
      },
    ],
  };

  const options = new OptionsHelper({
    loadRemoteJson: true,
  });

  it('should target activity field in Event models', () => {
    const isTargeted = rule.isFieldTargeted(model, 'activity');
    expect(isTargeted).toBe(true);
  });

  it('should return no error when an activity in the list is supplied', () => {
    const data = {
      type: 'Event',
    };

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(url => ({
      errorCode: JsonLoaderHelper.ERROR_NONE,
      statusCode: 200,
      data: activityList,
      url,
      exception: null,
      contentType: 'application/json',
      fetchTime: (new Date()).valueOf(),
    }));

    const activities = [
      {
        'skos:prefLabel': 'Football',
        type: 'Concept',
      },
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

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(url => ({
      errorCode: JsonLoaderHelper.ERROR_NONE,
      statusCode: 200,
      data: activityList,
      url,
      exception: null,
      contentType: 'application/json',
      fetchTime: (new Date()).valueOf(),
    }));

    const activities = [
      {
        id: 'https://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a3',
        prefLabel: 'Secret Football',
        type: 'Concept',
      },
      {
        id: 'https://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a3',
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
  it('should return an error when an activity list URL does not exist', () => {
    const data = {
      type: 'Event',
    };

    const activities = [
      {
        id: 'https://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a3',
        prefLabel: 'Not Real Football',
        type: 'Concept',
        inScheme: 'http://example.org/bad-list.jsonld',
      },
    ];

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(url => ({
      errorCode: JsonLoaderHelper.ERROR_NO_REMOTE,
      statusCode: 404,
      data: null,
      url,
      exception: null,
      contentType: null,
      fetchTime: (new Date()).valueOf(),
    }));

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
      expect(JsonLoaderHelper.getFile).toHaveBeenCalled();
      expect(errors.length).toBe(2);
      expect(errors[0].type).toBe(ValidationErrorType.FILE_NOT_FOUND);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
      expect(errors[1].type).toBe(ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST);
      expect(errors[1].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
  it('should return an error when using an old Activity List URL', () => {
    const data = {
      type: 'Event',
    };

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(url => ({
      errorCode: JsonLoaderHelper.ERROR_NONE,
      statusCode: 200,
      data: activityList,
      url,
      exception: null,
      contentType: 'application/json',
      fetchTime: (new Date()).valueOf(),
    }));

    const activities = [
      {
        id: 'https://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a3',
        prefLabel: 'Not Real Football',
        type: 'Concept',
        inScheme: 'https://openactive.io/activity-list/activity-list.jsonld',
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
      expect(JsonLoaderHelper.getFile).toHaveBeenCalled();
      expect(errors.length).toBe(2);
      expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
      expect(errors[1].type).toBe(ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST);
      expect(errors[1].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
  it('should return an error when an activity list URL contains invalid JSON', () => {
    const data = {
      type: 'Event',
    };

    const activities = [
      {
        id: 'https://openactive.io/activity-list/#a4375402-067d-4549-9d3a-8c1e998350a3',
        prefLabel: 'Not Real Football',
        type: 'Concept',
        inScheme: 'http://example.org/bad-list.jsonld',
      },
    ];

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(url => ({
      errorCode: JsonLoaderHelper.ERROR_NO_REMOTE,
      statusCode: 200,
      data: null,
      url,
      exception: null,
      contentType: 'text/html',
      fetchTime: (new Date()).valueOf(),
    }));

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
      expect(JsonLoaderHelper.getFile).toHaveBeenCalled();
      expect(errors.length).toBe(2);
      expect(errors[0].type).toBe(ValidationErrorType.FILE_NOT_FOUND);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
      expect(errors[1].type).toBe(ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST);
      expect(errors[1].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
