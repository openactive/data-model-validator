const _ = require('lodash');

const RawHelper = class {
  static isRpdeFeed(data) {
    if (!_.isPlainObject(data)) {
      return false;
    }
    const type = data['@type'] || data.type;
    // This is a JSON-LD object with a @type
    if (!_.isNil(type)) {
      return false;
    }
    if (!Array.isArray(data.items)) {
      return false;
    }
    for (const item of data.items) {
      if (item.state !== 'updated' && item.state !== 'deleted') {
        return false;
      }
    }
    // If the page has no items (e.g. a last page), it's still considered an RPDE feed.
    return true;
  }
};

module.exports = RawHelper;
