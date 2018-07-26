const OptionsHelper = class {
  constructor(options) {
    this.options = options || {};
  }

  get activityLists() {
    return this.options.activityLists || [];
  }

  get schemaOrgSpecifications() {
    return this.options.schemaOrgSpecifications || [];
  }

  get type() {
    return this.options.type;
  }
};

module.exports = OptionsHelper;
