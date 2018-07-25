const validate = require('./validate');
const ValidationErrorSeverity = require('./errors/validation-error-severity');
const ValidationErrorType = require('./errors/validation-error-type');

describe('validate', () => {
  let validEvent;
  beforeEach(() => {
    validEvent = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      id: 'http://www.example.org/events/1',
      type: 'Event',
      name: 'Tai chi Class',
      description: 'A Tai chi class',
      duration: 'PT1H',
      url: 'http://www.example.org/events/1',
      startDate: '2017-03-22T20:00:00Z',
      ageRange: {
        type: 'QuantitativeValue',
        minValue: 18,
        maxValue: 60,
      },
      genderRestriction: 'http://openactive.io/ns#None',
      activity: ['Tai Chi'],
      category: ['Martial Arts'],
      eventStatus: 'http://schema.org/EventScheduled',
      image: [{
        type: 'ImageObject',
        url: 'http://www.example.org/logo.png',
      }],
      subEvent: [{
        type: 'Event',
        id: 'http://www.example.org/events/12',
      }],
      organizer: [{
        id: 'http://www.example.org',
        type: 'Organization',
        name: 'Example Co',
        url: 'http://www.example.org',
        description: 'Example organizer',
        logo: [{
          type: 'ImageObject',
          url: 'http://www.example.org/logo.png',
        }],
      }],
      leader: [{
        id: 'http://www.example.org',
        type: 'Organization',
        name: 'Example Co',
        url: 'http://www.example.org',
        description: 'Example contributor',
        logo: [{
          type: 'ImageObject',
          url: 'http://www.example.org/logo.png',
        }],
      }],
      location: {
        id: 'http://www.example.org/locations/gym',
        type: 'Place',
        name: 'ExampleCo Gym',
        description: 'ExampleCo\'s main gym',
        image: [{
          type: 'ImageObject',
          url: 'http://www.example.org/gym.png',
        }],
        url: 'http://www.example.org/locations/gym',
        address: {
          type: 'PostalAddress',
          streetAddress: '1 High Street',
          addressLocality: 'Bristol',
          addressRegion: 'Bristol',
          addressCountry: 'GB',
          postalCode: 'BS1 4SD',
        },
        telephone: '0845000000',
        geo: {
          latitude: 51.4034423828125,
          longitude: -0.2369088977575302,
          type: 'GeoCoordinates',
        },
        openingHoursSpecification: [{
          type: 'OpeningHoursSpecification',
          opens: '07:00Z',
          closes: '21:00Z',
          dayOfWeek: 'http://schema.org/Monday',
        }],
        amenityFeature: [
          {
            name: 'Changing Facilities',
            value: true,
            type: 'ChangingRooms',
          },
        ],
      },
    };
  });

  it('should return a failure if passed an invalid model', () => {
    const data = {};

    const result = validate(data, 'InvalidModel');

    expect(result.length).toBe(1);
    expect(result[0].type).toBe(ValidationErrorType.MODEL_NOT_FOUND);
    expect(result[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });

  it('should return a warning if an array is passed to validate', () => {
    const data = [];

    const result = validate(data);

    expect(result.length).toBe(1);
    expect(result[0].type).toBe(ValidationErrorType.INVALID_JSON);
    expect(result[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });

  it('should return a failure if a non-object is passed to validate', () => {
    const data = 'bad_data';

    const result = validate(data);

    expect(result.length).toBe(1);
    expect(result[0].type).toBe(ValidationErrorType.INVALID_JSON);
    expect(result[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });

  it('should return no errors for a valid Event', () => {
    const event = Object.assign({}, validEvent);

    const result = validate(event);

    expect(result.length).toBe(0);
  });

  it('should provide a jsonpath to the location of a problem', () => {
    // This event is missing location addressRegion, which is a recommended field
    const event = Object.assign({}, validEvent);

    delete event.location.address.addressRegion;

    const result = validate(event);

    expect(result.length).toBe(1);

    expect(result[0].path).toBe('$.location.address.addressRegion');
  });

  it('should check submodels of a model even if we don\'t know what type it is', () => {
    const data = {
      type: 'UnknownType',
      geo: {
        latitude: 51.4034423828125,
        type: 'GeoCoordinates',
      },
      location: {
        type: 'SafariPark',
      },
    };

    const result = validate(data);

    expect(result.length).toBe(3);

    expect(result[0].type).toBe(ValidationErrorType.MODEL_NOT_FOUND);
    expect(result[0].severity).toBe(ValidationErrorSeverity.WARNING);
    expect(result[0].path).toBe('$');

    expect(result[1].type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
    expect(result[1].severity).toBe(ValidationErrorSeverity.FAILURE);
    expect(result[1].path).toBe('$.geo.longitude');

    expect(result[2].type).toBe(ValidationErrorType.MODEL_NOT_FOUND);
    expect(result[2].severity).toBe(ValidationErrorSeverity.WARNING);
    expect(result[2].path).toBe('$.location');
  });

  it('should cope with flexible model types', () => {
    const place = {
      id: 'http://www.example.org/locations/gym',
      type: 'Place',
      name: 'ExampleCo Gym',
      description: 'ExampleCo\'s main gym',
      image: [{
        type: 'ImageObject',
        url: 'http://www.example.org/gym.png',
      }],
      url: 'http://www.example.org/locations/gym',
      address: {
        type: 'PostalAddress',
        streetAddress: '1 High Street',
        addressLocality: 'Bristol',
        addressRegion: 'Bristol',
        addressCountry: 'GB',
        postalCode: 'BS1 4SD',
      },
      telephone: '0845000000',
      geo: {
        latitude: 51.4034423828125,
        longitude: -0.2369088977575302,
        type: 'GeoCoordinates',
      },
      openingHoursSpecification: [{
        type: 'OpeningHoursSpecification',
        opens: '07:00Z',
        closes: '21:00Z',
        dayOfWeek: 'http://schema.org/Monday',
      }],
      amenityFeature: [
        {
          name: 'Changing Facilities',
          value: true,
          type: 'ChangingRooms',
        },
        {
          name: 'My Place',
          value: true,
          type: 'ext:MyPlace',
        },
      ],
    };

    const result = validate(place);

    expect(result.length).toBe(1);

    expect(result[0].type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
    expect(result[0].severity).toBe(ValidationErrorSeverity.WARNING);
    expect(result[0].path).toBe('$.amenityFeature[1].type');
  });

  it('should cope with arrays of flexible model types mixed with invalid elements', () => {
    const place = {
      id: 'http://www.example.org/locations/gym',
      type: 'Place',
      name: 'ExampleCo Gym',
      description: 'ExampleCo\'s main gym',
      image: [{
        type: 'ImageObject',
        url: 'http://www.example.org/gym.png',
      }],
      url: 'http://www.example.org/locations/gym',
      address: {
        type: 'PostalAddress',
        streetAddress: '1 High Street',
        addressLocality: 'Bristol',
        addressRegion: 'Bristol',
        addressCountry: 'GB',
        postalCode: 'BS1 4SD',
      },
      telephone: '0845000000',
      geo: {
        latitude: 51.4034423828125,
        longitude: -0.2369088977575302,
        type: 'GeoCoordinates',
      },
      openingHoursSpecification: [{
        type: 'OpeningHoursSpecification',
        opens: '07:00Z',
        closes: '21:00Z',
        dayOfWeek: 'http://schema.org/Monday',
      }],
      amenityFeature: [
        {
          name: 'Changing Facilities',
          value: true,
          type: 'ChangingRooms',
        },
        'An invalid array element',
        {
          name: 'My Place',
          value: true,
          type: 'ext:MyPlace',
        },
      ],
    };

    const result = validate(place);

    expect(result.length).toBe(2);

    expect(result[0].type).toBe(ValidationErrorType.INVALID_TYPE);
    expect(result[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    expect(result[0].path).toBe('$.amenityFeature');

    expect(result[1].type).toBe(ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES);
    expect(result[1].severity).toBe(ValidationErrorSeverity.WARNING);
    expect(result[1].path).toBe('$.amenityFeature[2].type');
  });

  it('should not throw if a property of value null is passed', () => {
    const data = {
      type: 'Event',
      'beta:distance': null,
    };

    let result;

    const doValidate = () => {
      result = validate(data);
    };

    expect(doValidate).not.toThrow();
    expect(typeof result).toBe('object');
  });
});
