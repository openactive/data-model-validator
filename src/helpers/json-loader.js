const crypto = require('crypto');
const util = require('util');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const writeFileAtomic = require('write-file-atomic');
const OptionsHelper = require('./options');

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
    rawCacheContents = await util.promisify(fs.readFile)(cachePath);
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
  await writeFileAtomic(cachePath, JSON.stringify(fileObject), { chown: false, mode: false });
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
    response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/ld+json',
      },
    });
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
  // "All header names are lower cased" (See: https://github.com/axios/axios#response-schema)
  const contentType = headers['content-type'];
  return createSuccess(url, data, { statusCode: status, contentType });
}

function getOptionsOrDefault(options) {
  if (typeof options !== 'object' || options === null) {
    return new OptionsHelper();
  }
  return options;
}

/**
 * Get file from in-memory cache without being able to fetch it from remote.
 *
 * This will always return an ERROR_NO_REMOTE error unless JSON loader had
 * previously been called with option to fetch from remote and therefore had
 * a remote in its cache
 *
 * @param {string} url
 * @returns {Object} File object
 */
function getFileNoLoadRemote(url) {
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
async function getFileLoadRemote(url) {
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
async function getFileLoadRemoteAndCacheToFs(url, options) {
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
  static async getFile(url, options) {
    const localOptions = getOptionsOrDefault(options);
    if (!localOptions.loadRemoteJson) {
      return getFileNoLoadRemote(url);
    } if (localOptions.remoteJsonCachePath) {
      return getFileLoadRemoteAndCacheToFs(url, options);
    }
    return getFileLoadRemote(url);
  }
}

JsonLoaderHelper.ERROR_NONE = ERROR_NONE;
JsonLoaderHelper.ERROR_NO_REMOTE = ERROR_NO_REMOTE;

module.exports = JsonLoaderHelper;
