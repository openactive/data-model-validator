const request = require('sync-request');

const RequestHelper = class {
  static get(url, headers = {}) {
    return request('GET', url, headers);
  }
};

module.exports = RequestHelper;
