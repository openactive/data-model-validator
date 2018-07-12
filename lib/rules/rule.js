'use strict';

class Rule {
    constructor(options) {
        this._options = options;
        this._targetModel = null;
        this._targetField = {};
        this._description = "This is a base rule description that should be overridden.";
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

    get targetModel() {
        return this._targetModel;
    }

    get targetField() {
        return this._targetField;
    }

    isModelTargeted(model) {
        return (
            this._targetModel === '*'
            || this._targetModel === model.type
        ) && this._targetField === null;
    }

    isFieldTargeted(field, model) {
        return (
            this._targetModel === '*'
            || this._targetModel === model.type
        ) && (
            this._targetField === '*'
            || this._targetField === field
        );
    }

    getValue(field, model) {
        return model.getValue(field);
    }
}

module.exports = Rule;
