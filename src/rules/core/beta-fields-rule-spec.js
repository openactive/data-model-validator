

const BetaFieldsRule = require('./beta-fields-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('BetaFieldsRule', () => {
  const model = new Model({
    type: 'Event',
  });
  const rule = new BetaFieldsRule();

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if no beta fields are present', () => {
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

    const errors = rule.validate(data, model, null);

    expect(errors.length).toBe(0);
  });

  it('should return a warning per field if any beta fields are present', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
      'beta:experimental_field': 'This field is experimental',
      'beta:another_experimental_field': 'This field is also experimental',
      'Ext:an_extended_field': 'This field extends the OA spec',
    };

    const errors = rule.validate(data, model, null);

    expect(errors.length).toBe(3);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
