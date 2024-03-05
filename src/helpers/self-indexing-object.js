/**
 * A shorthand to create an object where keys and values are the same.
 *
 * e.g.
 *
 * ```js
 * > SelfIndexingObject.create(['a', 'b', 'c'])
 * { a: 'a', b: 'b', c: 'c' }
 * ```
 */
const SelfIndexingObject = {
  /**
   * @template TKey
   * @param {TKey[]} keys
   * @returns {Record<TKey, TKey>}
   */
  create(keys) {
    return keys.reduce((acc, key) => {
      acc[key] = key;
      return acc;
    }, {});
  },
};

module.exports = {
  SelfIndexingObject,
};
