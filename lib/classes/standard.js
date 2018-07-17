'use strict';

const Model = require('./model');

let Standard = class {

    constructor(data) {
        this._data = data;
    }

    get name() {
        return this._data.name;
    }

    get reference() {
        return this._data.reference;
    }

    get pattern() {
        return this._data.pattern;
    }

    get validationErrorMessage() {
        return this._data.validationErrorMessage;
    }

    get minLength() {
        return this._data.minLength;
    }

    get maxLength() {
        return this._data.maxLength;
    }

    validate(data) {
        if (typeof(this.pattern) !== 'undefined' && this.pattern !== '') {
            let r = new RegExp(this.pattern);
            if (!r.test(String(data))) {
                return false;
            }
        }

        if (typeof(this.minLength) !== 'undefined') {
            if (data.length < this.minLength) {
                return false;
            }
        }

        if (typeof(this.maxLength) !== 'undefined') {
            if (data.length > this.minLength) {
                return false;
            }
        }

        return true;
    }

}

module.exports = Standard;
