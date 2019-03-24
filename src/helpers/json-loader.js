const crypto = require('crypto');
const util = require('util');
const fs = require('fs');
const path = require('path');
const RequestHelper = require('./request');
const OptionsHelper = require('./options');

const promisifiedFs = {
  readFile: util.promisify(fs.readFile),
};

/**
 * @param {String} url
 * @returns {?Object} Returned object is `undefined` if not in cache
 */
getFromCacheIfExists(url) {
  const hash = crypto.createHash('sha256');
  hash.update(url);
  const hashKey = hash.digest('hex');

  if (typeof JsonLoaderHelper.cache[hashKey] !== 'undefined') {
    return JsonLoaderHelper.cache[hashKey];
  }
}

function getOptionsOrDefault(options) {
  if (typeof localOptions !== 'object' || localOptions === null) {
    return new OptionsHelper();
  }
  return options;
}

// TODO TODO TODO here i am
// I am refactoring out the `if (localOptions.remoteJsonCachePath) {` part of getFile
// Though I am now wondering if instead of trying to have both getFileAsync and getFileSync match,
// I should instead just rewrite getFileAsync as wholly separate and then mark getFileSync as deprecated
async function getSomething() {
  // TODO TODO TODO share with getFileSync
  cacheFile = path.join(localOptions.remoteJsonCachePath, `${hashKey}.json`);
  let json;
  try {
    await promisifiedFs.readFile(cacheFile);
    json = JSON
  } catch (error) {
    // File doesn't exist or JSON couldn't be read. Either way, this can be ignored
  }
}

function createErrorNoRemote() {
  return {
    errorCode: JsonLoaderHelper.ERROR_NO_REMOTE,
    statusCode: 0,
    data: null,
    url,
    contentType: null,
    fetchTime: (new Date()).valueOf(),
  };
}

class JsonLoaderHelper {
  static clearCache() {
    JsonLoaderHelper.cache = {};
  }

  /**
   * Get file from either a local cache or a remote URL.
   * This function uses synchronous IO calls.
   *
   * @param {String} url
   * @param {Object} options
   * @returns {Object}
   */
  static getFileSync(url, options) {
    const fromCache = this.getFromCacheIfExists(url);
    if (typeof fromCache !== undefined && fromCache !== null) {
      return fromCache;
    }
    const localOptions = getOptionsOrDefault(options);
    if (!localOptions.loadRemoteJson) {
      return createErrorNoRemote();
    }
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
      const response = RequestHelper.get(url, { accept: 'application/ld+json' });
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



  /**
   * Get file from either a local cache or a remote URL.
   * This function uses asynchronous IO calls and returns a Promise
   *
   * @param {String} url
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  static async getFileAsync(url, options) {
    const fromCache = this.getFromCacheIfExists(url);
    if (typeof fromCache !== undefined && fromCache !== null) {
      return fromCache;
    }
    const localOptions = getOptionsOrDefault(options);
    if (!localOptions.loadRemoteJson) {
      return createErrorNoRemote();
    }
    if (localOptions.remoteJsonCachePath) {
      // TODO TODO TODO share with getFileSync
      cacheFile = path.join(localOptions.remoteJsonCachePath, `${hashKey}.json`);
      let json;
      try {
        await promisifiedFs.readFile(cacheFile);
        json = JSON
      } catch (error) {
        // File doesn't exist or JSON couldn't be read. Either way, this can be ignored
      }
    }
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
      const response = RequestHelper.get(url, { accept: 'application/ld+json' });
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
