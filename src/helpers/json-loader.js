const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const RequestHelper = require('./request');
const OptionsHelper = require('./options');

class JsonLoaderHelper {
  static clearCache() {
    JsonLoaderHelper.cache = {};
  }

  static getFile(url, options) {
    const hash = crypto.createHash('sha256');
    hash.update(url);
    const hashKey = hash.digest('hex');

    if (typeof JsonLoaderHelper.cache[hashKey] !== 'undefined') {
      return JsonLoaderHelper.cache[hashKey];
    }

    let localOptions = options;
    if (typeof localOptions !== 'object' || localOptions === null) {
      localOptions = new OptionsHelper();
    }
    if (!localOptions.loadRemoteJson) {
      return {
        errorCode: JsonLoaderHelper.ERROR_NO_REMOTE,
        statusCode: 0,
        data: null,
        url,
        contentType: null,
        fetchTime: (new Date()).valueOf(),
      };
    }
    let cacheFile = null;
    if (localOptions.remoteJsonCachePath) {
      cacheFile = path.join(localOptions.remoteJsonCachePath, `${hashKey}.json`);
      if (fs.existsSync(cacheFile)) {
        let json;
        try {
          json = JSON.parse(
            fs.readFileSync(cacheFile),
          );
        } catch (e) {
          json = null;
        }
        if (
          typeof json === 'object'
          && json !== null
          && ((new Date()).valueOf() - json.fetchTime) < localOptions.remoteJsonCacheTimeToLive
        ) {
          JsonLoaderHelper.cache[hashKey] = json;
          return json;
        }
      }
    }
    const returnObject = {
      errorCode: JsonLoaderHelper.ERROR_NONE,
      data: null,
      statusCode: null,
      url,
      exception: null,
      contentType: null,
      fetchTime: (new Date()).valueOf(),
    };
    try {
      const response = RequestHelper.get(url);
      const { headers } = response;

      returnObject.contentType = headers['content-type'];
      returnObject.statusCode = response.statusCode;

      if (response.statusCode !== 200) {
        returnObject.errorCode = JsonLoaderHelper.ERROR_NO_REMOTE;
      } else {
        returnObject.data = JSON.parse(response.body);
      }
    } catch (err) {
      returnObject.exception = err;
      returnObject.errorCode = JsonLoaderHelper.ERROR_NO_REMOTE;
    }
    if (cacheFile) {
      fs.writeFile(cacheFile, JSON.stringify(returnObject), () => {});
    }
    return returnObject;
  }
}

JsonLoaderHelper.cache = {};

JsonLoaderHelper.ERROR_NONE = 'error_none';
JsonLoaderHelper.ERROR_NO_REMOTE = 'error_no_remote';

module.exports = JsonLoaderHelper;
