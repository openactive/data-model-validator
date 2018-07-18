'use strict';

const Field = require('./field');

let Model = class {

    constructor(data = {}, hasSpecification = false) {
        this._data = data;
        this._hasSpecification = hasSpecification;
    }

    get type() {
        return this._data.type;
    }

    set hasSpecification(hasSpecification) {
        this._hasSpecification = hasSpecification;
    }

    get hasSpecification() {
        return this._hasSpecification;
    }

    get hasId() {
        return this._data.hasId || false;
    }

    get idFormat() {
        return this._data.idFormat;
    }

    get sampleId() {
        return this._data.sampleId;
    }

    get requiredFields() {
        return this._data.requiredFields || [];
    }

    hasRequiredField(field) {
        return this.requiredFields.indexOf(field) >= 0;
    }

    get requiredOptions() {
        return this._data.requiredOptions || [];
    }

    get recommendedFields() {
        return this._data.recommendedFields || [];
    }

    hasRecommendedField(field) {
        return this.recommendedFields.indexOf(field) >= 0;
    }

    get inSpec() {
        return this._data.inSpec || [];
    }

    hasFieldInSpec(field) {
        return this.inSpec.indexOf(field) >= 0;
    }

    getPossibleModelsForField(field) {
        if (typeof(this.fields[field]) === 'undefined') {
            return [];
        }
        return (new Field(this.fields[field])).getPossibleModels();
    }

    get fields() {
        return this._data.fields || {};
    }

}

module.exports = Model;
