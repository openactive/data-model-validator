# OpenActive Data Model Validator

The OpenActive data model validator library.

[![Build Status](https://travis-ci.org/openactive/data-model-validator.svg?branch=master)](https://travis-ci.org/openactive/data-model-validator)
[![Known Vulnerabilities](https://snyk.io/test/github/openactive/data-model-validator/badge.svg)](https://snyk.io/test/github/openactive/data-model-validator)

## Introduction

This library allows developers to validate JSON models to the latest [OpenActive Modelling Opportunity Data](https://www.openactive.io/modelling-opportunity-data/) specification.

## Using in your application

This library can be used in your own application, perhaps as part of your CI pipeline.

### Install

```shell
$ npm install @openactive/data-model-validator
```

### Usage

```js

const { validate } = require('@openactive/data-model-validator');

const data = {
  '@context': 'https://www.openactive.io/ns/oa.jsonld',
  type: 'Event',
  name: 'Tai chi Class',
  url: 'http://www.example.org/events/1',
  startDate: '2017-03-22T20:00:00',
  activity: 'Tai Chi',
  location: {
    type: 'Place',
    name: 'ExampleCo Gym',
    address: {
      type: 'PostalAddress',
      streetAddress: '1 High Street',
      addressLocality: 'Bristol',
      postalCode: 'BS1 4SD'
    }
  }
};

// Check whether the JSON conforms to the Event model
const result = validate(data);

// Returns:
// [{category: 'conformance', type: 'missing_required_field', message: 'Required field is missing.', value: undefined, severity: 'failure', path: '$.context' }, ... ]

```

### Options

The `validate` method optionally accepts options for validation:

#### loadRemoteJson

**Default:** `false`

Whether to load remote JSON documents. For example, remote `@context` definitions or activity list definitions.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const data = {
  // ...
};

const options = {
  loadRemoteJson: true
};

const result = validate(data, options);
```

#### remoteJsonCachePath

**Default:** `null`

Used in conjunction with `loadRemoteJson`. If set, allows the JSON loader to cache requests.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const data = {
  // ...
};

const options = {
  loadRemoteJson: true,
  remoteJsonCachePath: '/tmp'
};

const result = validate(data, options);
```

#### remoteJsonCacheTimeToLive

**Default:** `3600`

Used in conjunction with `loadRemoteJson` and `remoteJsonCachePath`. It sets the number of seconds that the JSON loader should cache requests for.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const data = {
  // ...
};

const options = {
  loadRemoteJson: true,
  remoteJsonCachePath: '/tmp',
  remoteJsonCacheTimeToLive: 3600
};

const result = validate(data, options);
```

#### rpdeItemLimit

A limit of the number of RPDE `"updated"` data items to validate. It is helpful to limit the number of items validated for performance reasons.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const feed = {
  // ...
};

const options = {
  rpdeItemLimit: 10
};

const result = validate(feed, options);
```

#### schemaOrgSpecifications

An array of schema.org specifications in `JSON-LD` format. For example, see https://schema.org/version/latest/schema.jsonld

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const data = {
  // ...
};

const options = {
  schemaOrgSpecifications: [
    {
      '@context': {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
      },
      '@graph': [
        {
          '@id': 'http://schema.org/CafeOrCoffeeShop',
          '@type': 'rdfs:Class',
          'rdfs:comment': 'A cafe or coffee shop.',
          'rdfs:label': 'CafeOrCoffeeShop',
          'rdfs:subClassOf': {
            '@id': 'http://schema.org/FoodEstablishment'
          },
        },
        // ...
      ],
      '@id': 'http://schema.org/#3.4',
    },
  ],
};

const result = validate(data, options);
```

#### type

The validator will detect the type of the model being validated from the `type` property. You can override this by providing a type option.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const model = {
  type: 'CustomAction'
  // ...
};

const options = {
  type: 'Action'
};

const result = validate(model, options);
```

#### version

The version of the specification to validate against. If not provided, this will validate against the latest specification.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const model = {
  type: 'CustomAction'
  // ...
};

const options = {
  version: '2.0'
};

const result = validate(model, options);
```

#### doRunAsync

If true, the validator will run I/O actions asynchronously and return a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises). **It is recommended to have this option set to true** especially for an application that accepts multiple requests as it will unblock the event loop to be free to run other code concurrently.

By default it is set to false for backwards compatability.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

async function run() {
  const model = {
    type: 'CustomAction'
    // ...
  };

  const options = {
    doRunAsync: true
  };

  const result = await validate(model, options);
  
  // Do something with result
}
```

## Development

### Getting started

```shell
$ git clone git@github.com:openactive/data-model-validator.git
$ cd data-model-validator
$ npm install
```
### Running tests

This project uses [Jasmine](https://jasmine.github.io/) for its tests. All spec files are located alongside the files that they target.

To run tests locally, run:

```shell
$ npm test
```

The test run will also include a run of [eslint](https://eslint.org/). To run the tests without these, use:

```shell
$ npm run test-no-lint
```

### Contributing

Read the [Contributing Guide](./CONTRIBUTING.md) for information on how to write your own rules.
