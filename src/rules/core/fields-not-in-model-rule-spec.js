const FieldsNotInModelRule = require('./fields-not-in-model-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('FieldsNotInModelRule', () => {
  const model = new Model({
    type: 'Event',
    inSpec: [
      '@context',
      'type',
      'activity',
      'location',
    ],
    commonTypos: {
      offer: 'offers',
    },
  });
  model.hasSpecification = true;

  const rule = new FieldsNotInModelRule();

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if all fields are in the spec', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
      activity: {
        id: 'https://example.com/reference/activities#Speedball',
        inScheme: 'https://example.com/reference/activities',
        prefLabel: 'Speedball',
        type: 'Concept',
      },
      location: {
        address: {
          addressLocality: 'New Malden',
          addressRegion: 'London',
          postalCode: 'NW5 3DU',
          streetAddress: 'Raynes Park High School, 46A West Barnes Lane',
          type: 'PostalAddress',
        },
        description: 'Raynes Park High School in London',
        geo: {
          latitude: 51.4034423828125,
          longitude: -0.2369088977575302,
          type: 'GeoCoordinates',
        },
        id: 'https://example.com/locations/1234ABCD',
        identifier: '1234ABCD',
        name: 'Raynes Park High School',
        telephone: '01253 473934',
        type: 'Place',
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a failure per field if any fields are not in the spec', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
      invalid_field: 'This field is not in the spec',
      another_invalid_field: 'This field is also not in the spec',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(2);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.FIELD_NOT_IN_SPEC);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });

  it('should return a warning per field if any beta fields are present', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
      'beta:experimental_field': 'This field is experimental',
      'beta:another_experimental_field': 'This field is also experimental',
      'Ext:an_extended_field': 'This field extends the OA spec',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(3);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });

  it('should return a failure per field if a field is a typo', () => {
    const data = {
      type: 'Event',
      offer: {
        type: 'Offer',
        id: 'http://example.org/offer/1',
        name: 'Free Offer',
        price: 0.00,
        priceCurrency: 'GBP',
      },
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.FIELD_COULD_BE_TYPO);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
