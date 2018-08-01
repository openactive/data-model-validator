const Rules = require('./index');

describe('All Rules', () => {
  it('should have a name that matches their constructor', () => {
    for (let index = 0; index < Rules.length; index += 1) {
      const ruleObject = new Rules[index]();

      expect(ruleObject.meta.name).not.toBe('Rule');
      expect(ruleObject.meta.name).toBe(Rules[index].prototype.constructor.name);
    }
  });
  it('should have a description', () => {
    for (let index = 0; index < Rules.length; index += 1) {
      const ruleObject = new Rules[index]();

      expect(typeof ruleObject.meta.description).toBe('string');
    }
  });
  it('should have at least one test', () => {
    for (let index = 0; index < Rules.length; index += 1) {
      const ruleObject = new Rules[index]();

      expect(typeof ruleObject.meta.tests).toBe('object');
      expect(Object.keys(ruleObject.meta.tests).length).toBeGreaterThan(0);
    }
  });
  it('should have tests with a message, category, severity and type', () => {
    for (let index = 0; index < Rules.length; index += 1) {
      const ruleObject = new Rules[index]();

      for (const testKey in ruleObject.meta.tests) {
        if (Object.prototype.hasOwnProperty.call(ruleObject.meta.tests, testKey)) {
          expect(ruleObject.meta.tests[testKey].message).toBeDefined();
          expect(ruleObject.meta.tests[testKey].category).toBeDefined();
          expect(ruleObject.meta.tests[testKey].severity).toBeDefined();
          expect(ruleObject.meta.tests[testKey].type).toBeDefined();
        }
      }
    }
  });
});
