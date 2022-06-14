const OptionsHelper = class {
  constructor(options) {
    this.options = options || {};
  }

  get loadRemoteJson() {
    return this.options.loadRemoteJson || false;
  }

  get remoteJsonCachePath() {
    return this.options.remoteJsonCachePath;
  }

  get remoteJsonCacheTimeToLive() {
    return this.options.remoteJsonCacheTimeToLive || 3600;
  }

  get rpdeItemLimit() {
    return this.options.rpdeItemLimit;
  }

  get type() {
    return this.options.type;
  }

  get version() {
    return this.options.version || 'latest';
  }

  get validationMode() {
    return this.options.validationMode || 'RPDEFeed';
  }

  get rpdeKind() {
    return this.options.rpdeKind || null;
  }
};

module.exports = OptionsHelper;
