'use strict';

const Rule = require('../rule');
const ValidationError = require('../../validation-error');

module.exports = class FieldsNotInModelRule extends Rule {

    constructor(options) {
        super(options);
        this._targetModels = '*';
        this._description = "Validates that all fields are present in the specification.";
    }

    validateModel(data, model, parent) {
        let errors = [];
        for (let field in data) {
            if (model.inSpec.indexOf(field) < 0) {
                errors.push(
                    new ValidationError(
                        {
                            "category": "conformance",
                            "type": "field_not_in_spec",
                            "value": data[field],
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
