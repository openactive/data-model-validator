'use strict';

let ValidationErrorCategory = Object.freeze({
    CONFORMANCE: "conformance",
    DATA_QUALITY: "data-quality",
    RECOMMENDATION: "recommendation",
    INTERNAL: "internal" // Internal problem library
});

module.exports = ValidationErrorCategory;
