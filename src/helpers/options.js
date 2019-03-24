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

  get schemaOrgSpecifications() {
    return this.options.schemaOrgSpecifications || [];
  }

  get type() {
    return this.options.type;
  }

  get version() {
    return this.options.version || 'latest';
  }

  get doRunAsync() {
    return this.options.doRunAsync || false;
  }
};

module.exports = OptionsHelper;
