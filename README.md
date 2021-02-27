# OpenActive Data Model Validator

The OpenActive data model validator library.

[![Build Status](https://travis-ci.com/openactive/data-model-validator.svg?branch=master)](https://travis-ci.org/openactive/data-model-validator)
[![Known Vulnerabilities](https://snyk.io/test/github/openactive/data-model-validator/badge.svg)](https://snyk.io/test/github/openactive/data-model-validator)

## Introduction

This library allows developers to validate JSON models to the latest [OpenActive Modelling Opportunity Data](https://openactive.io/modelling-opportunity-data/) specification.

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
  '@context': 'https://openactive.io/',
  '@type': 'Event',
  name: 'Tai chi Class',
  url: 'http://www.example.org/events/1',
  startDate: '2017-03-22T20:00:00',
  activity: 'Tai Chi',
  location: {
    '@type': 'Place',
    name: 'ExampleCo Gym',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1 High Street',
      addressLocality: 'Bristol',
      postalCode: 'BS1 4SD'
    }
  }
};

// Check whether the JSON conforms to the Event model
const result = await validate(data);

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

const result = await validate(data, options);
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

const result = await validate(data, options);
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

const result = await validate(data, options);
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

const result = await validate(feed, options);
```


#### type

The validator will detect the type of the model being validated from the `type` property. You can override this by providing a type option.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const model = {
  '@type': 'CustomAction'
  // ...
};

const options = {
  '@type': 'Action'
};

const result = await validate(model, options);
```

#### version

The version of the specification to validate against. If not provided, this will validate against the latest specification.

e.g.

```js
const { validate } = require('@openactive/data-model-validator');

const model = {
  '@type': 'CustomAction'
  // ...
};

const options = {
  version: '2.0'
};

const result = await validate(model, options);
}
```

#### validationMode

Provides context as to how the data under validation is expected to be used and therefore some validation rules may or may not apply.
For example, OrderQuotes only have a customer attribute in the C2 phase and beyond of booking (so not in C1Request or C1Response nor any more generic published open data usage).

e.g. To only apply rules that are suitable for data used in a booking flow phase like C2Request:

```js
const { validate, ValidationMode } = require('@openactive/data-model-validator');

const model = {
  '@type': 'CustomAction'
  // ...
};

const options = {
  validationMode: 'C2Request'
  // ...
};

const result = validate(model, options);
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
