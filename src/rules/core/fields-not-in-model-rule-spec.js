const FieldsNotInModelRule = require('./fields-not-in-model-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const OptionsHelper = require('../../helpers/options');
const JsonLoaderHelper = require('../../helpers/json-loader');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('FieldsNotInModelRule', () => {
  const model = new Model({
    derivedFrom: 'https://schema.org/Event',
    baseSchemaClass: 'https://schema.org/Event', // Note property is added by loadModel, not in model files
    type: 'Event',
    inSpec: [
      '@context',
      'type',
      'activity',
      'location',
      'disallowed_field',
    ],
    notInSpec: [
      'disallowed_field',
    ],
    commonTypos: {
      offer: 'offers',
    },
  }, 'latest');
  model.hasSpecification = true;

  const rule = new FieldsNotInModelRule();

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if all fields are in the spec', async () => {
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'Event',
      activity: {
        '@id': 'https://example.com/reference/activities#Speedball',
        inScheme: 'https://example.com/reference/activities',
        prefLabel: 'Speedball',
        '@type': 'Concept',
      },
      location: {
        address: {
          addressLocality: 'New Malden',
          addressRegion: 'London',
          postalCode: 'NW5 3DU',
          streetAddress: 'Raynes Park High School, 46A West Barnes Lane',
          '@type': 'PostalAddress',
        },
        description: 'Raynes Park High School in London',
        geo: {
          latitude: 51.4034423828125,
          longitude: -0.2369088977575302,
          '@type': 'GeoCoordinates',
        },
        '@id': 'https://example.com/locations/1234ABCD',
        identifier: '1234ABCD',
        name: 'Raynes Park High School',
        telephone: '01253 473934',
        '@type': 'Place',
      },
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

  it('should return no errors if a field is in a custom context', async () => {
    const data = {
      '@context': [
        'https://openactive.io/',
        'http://example.org/ext/1.0/schema.jsonld',
      ],
      '@type': 'Event',
      'ext:myCustomProperty': 'foo',
    };

    const customContext = {
      '@context': {
        label: 'http://www.w3.org/2000/01/rdf-schema#label',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        ext: 'http://example.org/jsonld#',
        id: '@id',
      },
      'ext:myCustomProperty': {
        id: 'ext:myCustomProperty',
        label: 'This is the label',
      },
      'ext:myNumericProperty': {
        id: 'ext:myNumericProperty',
        label: 'This is a property with a number value',
        '@type': 'xsd:integer',
      },
      'ext:myURLProperty': {
        id: 'ext:myURLProperty',
        label: 'This is a property with a URI value',
        '@type': '@id',
      },
    };

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(async (url) => ({
      errorCode: JsonLoaderHelper.ERROR_NONE,
      statusCode: 200,
      data: customContext,
      url,
      exception: null,
      contentType: 'application/json',
      fetchTime: (new Date()).valueOf(),
    }));

    const options = new OptionsHelper({
      loadRemoteJson: true,
    });

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return an error if a field is not in a custom context', async () => {
    const data = {
      '@context': [
        'https://openactive.io/',
        'http://example.org/ext/1.0/schema.jsonld',
      ],
      '@type': 'Event',
      'ext:myInvalidCustomProperty': 'foo',
    };

    const customContext = {
      '@context': {
        label: 'http://www.w3.org/2000/01/rdf-schema#label',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
        ext: 'http://example.org/jsonld#',
        id: '@id',
      },
      'ext:myCustomProperty': {
        id: 'ext:myCustomProperty',
        label: 'This is the label',
      },
      'ext:myNumericProperty': {
        id: 'ext:myNumericProperty',
        label: 'This is a property with a number value',
        '@type': 'xsd:integer',
      },
      'ext:myURLProperty': {
        id: 'ext:myURLProperty',
        label: 'This is a property with a URI value',
        '@type': '@id',
      },
    };

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(async (url) => ({
      errorCode: JsonLoaderHelper.ERROR_NONE,
      statusCode: 200,
      data: customContext,
      url,
      exception: null,
      contentType: 'application/json',
      fetchTime: (new Date()).valueOf(),
    }));

    const options = new OptionsHelper({
      loadRemoteJson: true,
    });

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return no errors if a field is in a custom context with a graph', async () => {
    const data = {
      '@context': [
        'https://openactive.io/',
        'http://example.org/ext/1.0/schema.jsonld',
      ],
      '@type': 'Event',
      'ext:customName': 'Custom Event',
    };

    const customContext = {
      '@context': {
        ext: 'http://example.org/ext#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
      },
      '@graph': [
        {
          '@id': 'http://example.org/ext#customName',
          '@type': 'rdf:Property',
          'https://schema.org/domainIncludes': {
            '@id': 'https://schema.org/Thing',
          },
          'https://schema.org/rangeIncludes': {
            '@id': 'https://schema.org/Text',
          },
          'rdfs:comment': 'A custom property.',
          'rdfs:label': 'customName',
        },
      ],
      '@id': 'http://example.org/ext#1.0',
    };

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(async (url) => ({
      errorCode: JsonLoaderHelper.ERROR_NONE,
      statusCode: 200,
      data: customContext,
      url,
      exception: null,
      contentType: 'application/json',
      fetchTime: (new Date()).valueOf(),
    }));

    const options = new OptionsHelper({
      loadRemoteJson: true,
    });

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a warning per field if any fields are not in the spec, but are in schema.org', async () => {
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'Event',
      alternateName: 'Alternate Event',
    };

    const options = new OptionsHelper({
    });

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.SCHEMA_ORG_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.NOTICE);
    }
  });

  it('should return a failure per field if any fields are not allowed in the spec', async () => {
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'Event',
      disallowed_field: 'This field is disallowed by the spec',
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
      expect(error.type).toBe(ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return a failure per field if any fields are not in the spec', async () => {
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'Event',
      invalid_field: 'This field is not in the spec',
      another_invalid_field: 'This field is also not in the spec',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(2);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.FIELD_NOT_IN_SPEC);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return a notice per field if any extension fields are present', async () => {
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'Event',
      'beta:experimental_field': 'This field is experimental',
      'beta:another_experimental_field': 'This field is also experimental',
      'Ext:an_extended_field': 'This field extends the OA spec',
      'btf:raceTypes': ['test'],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(4);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return a failure per field if a field has been superseded', async () => {
    const schedule = new Model({
      type: 'PartialSchedule',
      inSpec: [
        'type',
      ],
    }, 'latest');
    schedule.hasSpecification = true;

    const data = {
      '@context': [
        'https://openactive.io',
        'https://openactive.io/ns-beta',
      ],
      '@type': 'PartialSchedule',
      'beta:oldProperty': 'America/New_York',
    };

    const customContext = {
      '@context': {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        schema: 'https://schema.org/',
        oa: 'https://openactive.io/',
        label: 'rdfs:label',
        comment: 'rdfs:comment',
        domainIncludes: {
          '@id': 'schema:domainIncludes',
          '@type': '@id',
        },
        rangeIncludes: {
          '@id': 'schema:rangeIncludes',
          '@type': '@id',
        },
        Property: 'rdf:Property',
        Class: 'rdfs:Class',
        supersededBy: 'schema:supersededBy',
        beta: 'https://openactive.io/ns-beta#',
      },
      '@graph': [
        {
          '@id': 'beta:oldProperty',
          '@type': 'Property',
          label: 'oldProperty',
          comment: 'This old property has now been deprecated.',
          supersededBy: 'schema:scheduleTimezone',
          domainIncludes: [
            'oa:PartialSchedule',
          ],
          rangeIncludes: [
            'schema:Text',
          ],
        },
      ],
    };

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(async (url) => ({
      errorCode: JsonLoaderHelper.ERROR_NONE,
      statusCode: 200,
      data: customContext,
      url,
      exception: null,
      contentType: 'application/json',
      fetchTime: (new Date()).valueOf(),
    }));

    const options = new OptionsHelper({
      loadRemoteJson: true,
      validationMode: 'C1Response',
    });

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      schedule,
      options,
    );

    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC);
  });

  it('should return a failure per field if a field is a typo', async () => {
    const data = {
      '@type': 'Event',
      offer: {
        '@type': 'Offer',
        '@id': 'http://example.org/offer/1',
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

    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.FIELD_COULD_BE_TYPO);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
