

const ValidationErrorCategory = Object.freeze({
  CONFORMANCE: 'conformance',
  DATA_QUALITY: 'data-quality',
  // SUGGESTION: 'suggestion', // Removed as unused and unsupported
  INTERNAL: 'internal', // Internal problem library
});

module.exports = ValidationErrorCategory;
