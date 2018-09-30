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

  const schemaOrgSpec = {
    '@context': {
      rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
      xsd: 'http://www.w3.org/2001/XMLSchema#',
    },
    '@graph': [
      {
        '@id': 'https://schema.org/Event',
        '@type': 'rdfs:Class',
        'http://www.w3.org/2002/07/owl#equivalentClass': {
          '@id': 'http://purl.org/dc/dcmitype/Event',
        },
        'rdfs:comment': 'An event happening at a certain time and location, such as a concert, lecture, or festival. Ticketing information may be added via the <a class="localLink" href="https://schema.org/offers">offers</a> property. Repeated events may be structured as separate Event objects.',
        'rdfs:label': 'Event',
        'rdfs:subClassOf': {
          '@id': 'https://schema.org/Thing',
        },
      },
      {
        '@id': 'https://schema.org/Thing',
        '@type': 'rdfs:Class',
        'rdfs:comment': 'The most generic type of item.',
        'rdfs:label': 'Thing',
      },
      {
        '@id': 'https://schema.org/alternateName',
        '@type': 'rdf:Property',
        'https://schema.org/domainIncludes': {
          '@id': 'https://schema.org/Thing',
        },
        'https://schema.org/rangeIncludes': {
          '@id': 'https://schema.org/Text',
        },
        'rdfs:comment': 'An alias for the item.',
        'rdfs:label': 'alternateName',
      },
    ],
    '@id': 'https://schema.org/#3.4',
  };

  const rule = new FieldsNotInModelRule();

  it('should target fields of any type', () => {
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if all fields are in the spec', () => {
    const data = {
      '@context': 'https://openactive.io/',
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

  it('should return no errors if a field is in a custom context', () => {
    const data = {
      '@context': [
        'https://openactive.io/',
        'http://example.org/ext/1.0/schema.jsonld',
      ],
      type: 'Event',
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

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(url => ({
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
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return an error if a field is not in a custom context', () => {
    const data = {
      '@context': [
        'https://openactive.io/',
        'http://example.org/ext/1.0/schema.jsonld',
      ],
      type: 'Event',
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

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(url => ({
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
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.NOTICE);
    }
  });

  it('should return no errors if a field is in a custom context with a graph', () => {
    const data = {
      '@context': [
        'https://openactive.io/',
        'http://example.org/ext/1.0/schema.jsonld',
      ],
      type: 'Event',
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

    spyOn(JsonLoaderHelper, 'getFile').and.callFake(url => ({
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
      schemaOrgSpecifications: [schemaOrgSpec],
    });

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a warning per field if any fields are not in the spec, but are in schema.org', () => {
    const data = {
      '@context': 'https://openactive.io/',
      type: 'Event',
      alternateName: 'Alternate Event',
    };

    const options = new OptionsHelper({
      schemaOrgSpecifications: [schemaOrgSpec],
    });

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
      options,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.SCHEMA_ORG_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.NOTICE);
    }
  });

  it('should return a failure per field if any fields are not allowed in the spec', () => {
    const data = {
      '@context': 'https://openactive.io/',
      type: 'Event',
      disallowed_field: 'This field is disallowed by the spec',
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
      expect(error.type).toBe(ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return a failure per field if any fields are not in the spec', () => {
    const data = {
      '@context': 'https://openactive.io/',
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
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  it('should return a notice per field if any extension fields are present', () => {
    const data = {
      '@context': 'https://openactive.io/',
      type: 'Event',
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

    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(4);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED);
      expect(error.severity).toBe(ValidationErrorSeverity.NOTICE);
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
