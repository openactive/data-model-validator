const PrecisionHelper = class {
  static getPrecision(a) {
    if (typeof a !== 'number') {
      return 0;
    }
    if (!Number.isFinite(a)) {
      return 0;
    }
    let e = 1;
    let p = 0;
    while (Math.round(a * e) / e !== a) {
      e *= 10;
      p += 1;
    }
    return p;
  }
};

module.exports = PrecisionHelper;
