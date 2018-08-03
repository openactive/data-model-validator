const RawHelper = class {
  static isRpdeFeed(data) {
    if (
      typeof data !== 'object'
      || data === null
      || data instanceof Array
    ) {
      return false;
    }
    if (
      typeof data.type === 'undefined'
      && typeof data['@type'] === 'undefined'
      && typeof data.items !== 'undefined'
      && data.items instanceof Array
    ) {
      for (const item of data.items) {
        if (
          typeof item.state === 'string'
          && (
            item.state === 'updated'
            || item.state === 'deleted'
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }
};

module.exports = RawHelper;
