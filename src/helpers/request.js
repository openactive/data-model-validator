const request = require('sync-request');

const RequestHelper = class {
  /**
   * @deprecated since version 1.2.0, since it uses synchronous IO
   *   (https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/#comparing-code). Use
   *   axios instead
   */
  static get(url, headers = {}) {
    return request('GET', url, { headers });
  }
};

module.exports = RequestHelper;
