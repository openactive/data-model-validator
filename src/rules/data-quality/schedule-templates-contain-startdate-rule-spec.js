const ScheduleTemplatesContainStartDate = require('./schedule-templates-contain-startdate-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ScheduleTemplatesContainStartDate', () => {
  let model;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'Schedule',
      fields: {
        idTemplate: {
          fieldName: 'idTemplate',
          sameAs: 'https://openactive.io/idTemplate',
          requiredType: 'https://schema.org/Text',
          example: 'https://api.example.org/session-series/123/{startDate}',
          description: [
            'An RFC6570 compliant URI template that can be used to generate a unique identifier (`@id`) for every event described by the schedule. This property is required if the data provider is supporting third-party booking via the Open Booking API, or providing complimentary individual `subEvent`s.',
          ],
          valueConstraint: 'UriTemplate',
        },
        urlTemplate: {
          fieldName: 'urlTemplate',
          sameAs: 'https://schema.org/urlTemplate',
          requiredType: 'https://schema.org/Text',
          example: 'https://example.org/session-series/123/{startDate}',
          description: [
            'An RFC6570 compliant URI template that can be used to generate a unique `url` for every event described by the schedule. This property is required if the data provider wants to provide participants with a unique URL to book to attend an event.',
          ],
          valueConstraint: 'UriTemplate',
        },
      },
    }, 'latest');
    rule = new ScheduleTemplatesContainStartDate();
  });

  it('should target idTemplate and urlTemplate in Schedule model', () => {
    let isTargeted = rule.isFieldTargeted(model, 'idTemplate');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'urlTemplate');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the urlTemplate contains {startDate}', async () => {
    const data = {
      '@type': 'Schedule',
      urlTemplate: 'https://api.example.org/session-series/123/{startDate}',
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

  it('should return no errors if the idTemplate contains {startDate}', async () => {
    const data = {
      '@type': 'Schedule',
      idTemplate: 'https://api.example.org/session-series/123/{startDate}',
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

  it('should return errors if the urlTemplate does not contain {startDate}', async () => {
    const data = {
      '@type': 'Schedule',
      urlTemplate: 'htts://api.example.org/session-series/123/',
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
      expect(error.type).toBe(ValidationErrorType.URI_TEMPLATE_MISSING_PLACEHOLDER);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return errors if the idTemplate does not contain {startDate}', async () => {
    const data = {
      '@type': 'Schedule',
      idTemplate: 'htts://api.example.org/session-series/123/',
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
      expect(error.type).toBe(ValidationErrorType.URI_TEMPLATE_MISSING_PLACEHOLDER);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
