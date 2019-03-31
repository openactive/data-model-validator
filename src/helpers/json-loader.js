const crypto = require('crypto');
const util = require('util');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const RequestHelper = require('./request');
const OptionsHelper = require('./options');

const promisifiedFs = {
  readFile: util.promisify(fs.readFile),
  writeFile: util.promisify(fs.writeFile),
};

const ERROR_NONE = 'error_none';
const ERROR_NO_REMOTE = 'error_no_remote';
let CACHE = {};

function createErrorNoRemote(url, {
  statusCode = 0, contentType = null, exception = null, data = null,
} = {}) {
  return {
    errorCode: ERROR_NO_REMOTE,
    statusCode,
    data,
    url,
    contentType,
    exception,
    fetchTime: (new Date()).getTime(),
  };
}

function createSuccess(url, data, { statusCode, contentType }) {
  return {
    errorCode: ERROR_NONE,
    data,
    statusCode,
    url,
    exception: null,
    contentType,
    fetchTime: (new Date()).getTime(),
  };
}

/**
 * Hash of URL which can be used as a key to a cache
 *
 * @param {string} url
 * @returns {string}
 */
function getUrlCacheKey(url) {
  const hash = crypto.createHash('sha256');
  hash.update(url);
  return hash.digest('hex');
}

/**
 * @param {string} url
 * @returns {{exists: Boolean, value?: Object}}
 */
function getFromInMemoryCacheIfExists(url) {
  const cacheKey = getUrlCacheKey(url);

  if (cacheKey in CACHE) {
    return {
      exists: true,
      value: CACHE[cacheKey],
    };
  }
  return {
    exists: false,
  };
}

function saveToInMemoryCache(url, fileObject) {
  const cacheKey = getUrlCacheKey(url);
  CACHE[cacheKey] = fileObject;
}

/**
 * Path in File System where URL would be cached
 *
 * @param {string} baseCachePath
 * @param {string} url
 * @returns {string}
 */
function getFsCachePath(baseCachePath, url) {
  const cacheKey = getUrlCacheKey(url);
  return path.join(baseCachePath, `${cacheKey}.json`);
}

/**
 * Get from File System cache if exists
 *
 * @param {string} baseCachePath
 * @param {string} url
 * @returns {Promise<{exists: Boolean, value?: Object}>}
 */
async function getFromFsCacheIfExists(baseCachePath, url) {
  const cachePath = getFsCachePath(baseCachePath, url);
  let rawCacheContents;
  try {
    rawCacheContents = await promisifiedFs.readFile(cachePath);
  } catch (error) {
    // Probably just doesn't exist
    return { exists: false };
  }
  const parsed = JSON.parse(rawCacheContents);
  return {
    exists: true,
    value: parsed,
  };
}

async function saveToFsCache(baseCachePath, url, fileObject) {
  const cachePath = getFsCachePath(baseCachePath, url);
  await promisifiedFs.writeFile(cachePath, JSON.stringify(fileObject));
}

/**
 * Get from remote URL
 *
 * @param {string} url
 * @returns {Promise<Object>}
 */
async function getFromRemoteUrl(url) {
  let response;
  try {
    response = axios.get(url, { headers: 'application/ld+json' });
  } catch (error) {
    if (error.response) {
      const { data, headers, status } = error.response;
      const contentType = headers['content-type'];
      return createErrorNoRemote(url, {
        statusCode: status, contentType, exception: error, data,
      });
    }
    return createErrorNoRemote(url);
  }
  const { data, headers, status } = response;
  const contentType = headers['content-type'];
  return createSuccess(url, data, { statusCode: status, contentType });
}

function getOptionsOrDefault(options) {
  if (typeof options !== 'object' || options === null) {
    return new OptionsHelper();
  }
  return options;
}

// TODO TODO TODO why fetch from in-memory if it could never be populated?
/**
 * Get file from in-memory cache without being able to fetch it from remote.
 *
 * @param {string} url
 * @returns {Object} File object
 */
function getFileAsyncNoLoadRemote(url) {
  const { exists, value: fromCache } = getFromInMemoryCacheIfExists(url);
  if (exists) {
    return fromCache;
  }
  return createErrorNoRemote(url);
}

/**
 * @param {string} url
 * @returns {Promise<Object>} File object
 */
async function getFileAsyncLoadRemote(url) {
  {
    const { exists, value: fromCache } = getFromInMemoryCacheIfExists(url);
    if (exists) {
      return fromCache;
    }
  }
  const remoteFileObject = await getFromRemoteUrl(url);
  saveToInMemoryCache(url, remoteFileObject);
  return remoteFileObject;
}

/**
 * Get file from remote and cache it to filesystem.
 *
 * If file is already in in-memory cache or filesystem cache, it is taken from these
 *
 * @param {string} url
 * @param {Object} options
 * @returns {Object}
 */
async function getFileAsyncLoadRemoteAndCacheToFs(url, options) {
  {
    const { exists, value: fromCache } = getFromInMemoryCacheIfExists(url);
    if (exists) {
      return fromCache;
    }
  }
  {
    const { exists, value: fromFsCache } = await getFromFsCacheIfExists(options.remoteJsonCachePath, url);
    if (exists) {
      const nowMs = (new Date()).getTime();
      const ageSeconds = (nowMs - fromFsCache.fetchTime) / 1000;
      if (ageSeconds < options.remoteJsonCacheTimeToLive) {
        saveToInMemoryCache(url, fromFsCache);
        return fromFsCache;
      }
    }
  }
  const remoteFileObject = await getFromRemoteUrl(url);
  saveToInMemoryCache(url, remoteFileObject);
  await saveToFsCache(options.remoteJsonCachePath, url, remoteFileObject);
  return remoteFileObject;
}

class JsonLoaderHelper {
  static clearCache() {
    CACHE = {};
  }

  /**
   * Get file from either a local cache or a remote URL.
   * This function uses asynchronous IO calls and returns a Promise.
   *
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Object>} File object
   */
  static async getFileAsync(url, options) {
    const localOptions = getOptionsOrDefault(options);
    if (!localOptions.loadRemoteJson) {
      return getFileAsyncNoLoadRemote(url);
    } if (localOptions.remoteJsonCachePath) {
      return await getFileAsyncLoadRemoteAndCacheToFs(url, options);
    }
    return await getFileAsyncLoadRemote(url);
  }

  /**
   * Get file from either a local cache or a remote URL.
   * This function uses synchronous IO calls.
   *
   * @deprecated since version 1.2.0. Use JsonLoaderHelper.getFileAsync() instead.
   *
   * @param {string} url
   * @param {Options} options
   * @returns {Object} File object
   */
  static getFile(url, options) {
    const hash = crypto.createHash('sha256');
    hash.update(url);
    const hashKey = hash.digest('hex');

    if (typeof CACHE[hashKey] !== 'undefined') {
      return CACHE[hashKey];
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
          CACHE[hashKey] = json;
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
JsonLoaderHelper.ERROR_NONE = ERROR_NONE;
JsonLoaderHelper.ERROR_NO_REMOTE = ERROR_NO_REMOTE;

module.exports = JsonLoaderHelper;
