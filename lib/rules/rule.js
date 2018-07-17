'use strict';

class Rule {
    constructor(options) {
        this._options = options;
        this._targetModels = [];
        this._targetFields = {};
        this._description = "This is a base rule description that should be overridden.";
    }

    validate(data, model, parent) {
        let errors = [];
        if (this.isModelTargeted(model)) {
            errors = errors.concat(this.validateModel(data, model, parent));
        }
        for (let field in data) {
            if (this.isFieldTargeted(field, model)) {
                errors = errors.concat(this.validateField(data, field, model, parent));
            }
        }
        return errors;
    }

    validateModel(data, model, parent) {
        throw 'Model validation rule not implemented';
    }

    validateField(data, field, model, parent) {
        throw 'Field validation rule not implemented';
    }

    get description() {
        return this._description;
    }

    get type() {
        return "rule";
    }

    get targetModels() {
        return this._targetModels;
    }

    get targetFields() {
        return this._targetFields;
    }

    isModelTargeted(model) {
        return (
            this._targetModels === '*'
            || this._targetModels === model.type
            || (
                this._targetModels instanceof Array
                && this._targetModels.indexOf(model.type) >= 0
            )
        );
    }

    isFieldTargeted(field, model) {
        return (
            this._targetFields === '*'
            || (
                typeof(this._targetFields) === 'object'
                && typeof(this._targetFields[model.type]) !== 'undefined'
                && (
                    this._targetFields[model.type] === '*'
                    || this._targetFields[model.type] === field
                    || (
                        this._targetFields[model.type] instanceof Array
                        && this._targetFields[model.type].indexOf(field) >= 0
                    )
                )
            )
        );
    }
}

module.exports = Rule;
