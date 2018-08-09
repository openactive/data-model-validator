const JsonLoaderHelper = require('../../src/helpers/json-loader');
const PropertyHelper = require('../../src/helpers/property');

beforeEach(function() {
  PropertyHelper.clearCache();
  JsonLoaderHelper.clearCache();
});
