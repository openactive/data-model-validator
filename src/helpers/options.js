const OptionsHelper = class {
  constructor(options) {
    this.options = options || {};
  }

  get activityLists() {
    return this.options.activityLists || [];
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
};

module.exports = OptionsHelper;
