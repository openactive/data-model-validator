'use strict';

const Rule = require('../rule');
const ValidationError = require('../../validation-error');

module.exports = class RequiredFieldsRule extends Rule {

    constructor(options) {
        super(options);
        this._targetModel = '*';
        this._targetField = null;
        this._description = "Validates that all recommended fields are present in the JSON data.";
    }

    validateModel(data, model, parent) {
        let errors = [];
        for (let field of model.recommendedFields) {
            if (typeof(data[field]) === 'undefined'
                || data[field] === null
            ) {
                errors.push(
                    new ValidationError(
                        {
                            "category": "conformance",
                            "type": "missing_recommended_field",
                            "value": undefined,
                            "severity": "warning",
                            "path": field
                        }
                    )
                );
            }
        }
        return errors;
    }
}
