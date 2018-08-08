const request = require('sync-request');

const RequestHelper = class {
  static get(url) {
    return request('GET', url);
  }
};

module.exports = RequestHelper;
