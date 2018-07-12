# OpenActive Data Model Validator

The OpenActive data model validator library.

## Introduction

This library allows developers to validate JSON models to the latest [OpenActive Modelling Opportunity Data](https://www.openactive.io/modelling-opportunity-data/) specification.

## Example

```js

const Validator = require('openactive-data-model-validator');

const model = {
    "@context": "https://www.openactive.io/ns/oa.jsonld",
    "type": "Event",
    "name": "Tai chi Class",
    "url": "http://www.example.org/events/1",
    "startDate": "2017-03-22T20:00:00",
    "activity": "Tai Chi",
    "location": {
        "type": "Place",
        "name": "ExampleCo Gym",
        "address": {
            "type": "PostalAddress",
            "streetAddress": "1 High Street",
            "addressLocality": "Bristol",
            "postalCode": "BS1 4SD"
        }
    }
};

// Check whether the JSON conforms to the Event model
const result = Validator.validate(model, 'Event');

// Returns:
// [{category: 'conformance', type: 'missing_required_field', message: 'Required field is missing.', value: undefined, severity: 'failure', path: '$.context' }, ... ]

```

## Development

### Getting started

```shell
$ git clone git@github.com:openactive/data-model-validator.git
$ cd data-model-validator
$ npm install
```
### Running tests

This project uses [Jasmine 1.3](https://jasmine.github.io/) for its tests via [jasmine-node](https://github.com/mhevery/jasmine-node). All spec files are located alongside the files that they target.

To run tests, run:

```shell
$ npm test
```

### Adding rules

To add a new rule, you will need to extend the `Rule` class, following these rules:

* Set `this._targetModels` to the name of model you are targeting, or a `*` wildcard.
* Optionally set `this._targetFields` to the name of field you are targeting, or a `*` wildcard. Setting the property to `null` means that the rule will be applied once to the whole model.
* Set `this._description` to explain what the rule is testing for.
* If just targeting models, implement `validateModel`.
* If targeting specific fields, implement `validateField`.
* Write a test for your rule.
* Add the rule to the list in `rules/index`, so that it is processed.

#### Example

```js
const Rule = require('../rule');
const ValidationError = require('../../validation-error');

module.exports = class RequiredFieldsRule extends Rule {
    
    constructor(options) {
        super(options);
        this._targetModels = '*';
        this._description = "Validates that all required fields are present in the JSON data.";
    }
    
    validateModel(data, model, parent) {
        let errors = [];
        for (let field of model.requiredFields) {
            if (typeof(data[field]) === 'undefined'
                || data[field] === null
            ) {
                errors.push(
                    new ValidationError(
                        {
                            "category": "conformance",
                            "type": "missing_required_field",
                            "value": undefined,
                            "severity": "failure",
                            "path": field
                        }
                    )
                );
            }
        }
        return errors;
    }
}
```
