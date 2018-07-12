'use strict';

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
