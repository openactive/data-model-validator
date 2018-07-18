'use strict';

const ValidationErrorMessage = require('./validation-error-message');

let ValidationError = class {

    constructor(data) {
        if ((typeof(data.message) === 'undefined'
            || data.message === null)
            && typeof(data.type) !== 'undefined'
            && typeof(ValidationErrorMessage[data.type]) !== 'undefined'
        ) {
            data.message = ValidationErrorMessage[data.type];
        }
        this._data = data;
    }

    get data() {
        return {
            "category": this.category,
            "type": this.type,
            "message": this.message,
            "value": this.value,
            "severity": this.severity,
            "path": this.path
        };
    }

    get category() {
        return this._data.category;
    }

    get type() {
        return this._data.type;
    }

    get message() {
        return this._data.message;
    }

    get severity() {
        return this._data.severity;
    }

    set path(path) {
        this._data.path = path;
    }

    get path() {
        return this._data.path;
    }

    get value() {
        return this._data.value;
    }
}

module.exports = ValidationError;
