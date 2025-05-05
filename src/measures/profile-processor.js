// After validation is complete, and errors have been generated, the following set of profiles are applied to the errors array.
// The results of this are rendered to a separate "profileMeasures" array, which are available to:
// - The test suite's HTML output
// - The validator (as a tab or collapsable box on the right-hand side?), potentially linking to the errors themselves below (which would then be available in the visualiser)
// - The status page

// Open questions:
// - Do we need to think about combining parent and child in the feed within the test suite for a more accurate assessment of e.g. the `url`?

const ExclusionMode = require('./exclusion-modes');
const profiles = require('.');

const ProfileProcessor = class {
  static matchTree(targetFields, tree) {
    const { name } = tree.slice(-1)[0];
    const { type } = tree.slice(-2)[0];
    for (const [targetType, targetField] of Object.entries(targetFields)) {
      if (targetType === type && targetField.includes(name)) return true;
    }
    return false;
  }

  static doesErrorMatchExclusion(error, exclusion) {
    return exclusion.errorType.includes(error.type)
      && (
        (exclusion.targetFields && this.matchTree(exclusion.targetFields, error.pathTree))
        || (exclusion.targetPaths
          && exclusion.targetPaths.some((path) => path.test(error.path)))
      );
  }

  static doErrorsMatchExclusionsInMeasure(errors, measure) {
    const matchingExclusions = measure.exclusions.filter((exclusion) => errors.some((error) => this.doesErrorMatchExclusion(error, exclusion)));
    return measure.exclusionMode === ExclusionMode.ALL ? matchingExclusions.length === measure.exclusions.length : matchingExclusions.length > 0;
  }

  static calculateMeasures(errors) {
    const results = {};
    for (const profile of profiles) {
      const profileResult = {};
      for (const measure of profile.measures) {
        profileResult[measure.name] = this.doErrorsMatchExclusionsInMeasure(errors, measure) ? 0 : 1;
      }
      results[profile.identifier] = profileResult;
    }
    return results;
  }
};

module.exports = ProfileProcessor;
