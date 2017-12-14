const plugin = require("..");

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const rules = fs
  .readdirSync(path.resolve(__dirname, "../lib/rules/"))
  .map(f => path.basename(f, ".js"));

describe("all rule files should be exported by the plugin", () => {
  rules.forEach(ruleName => {
    it("should export " + ruleName, () => {
      assert.equal(
        plugin.rules[ruleName],
        require(path.join("../lib/rules", ruleName))
      );
    });
  });
});

describe("configurations", () => {
  it("we should export an 'all' configuration", () => {
    assert(plugin.configs.all);
    Object.keys(plugin.configs.all.rules).forEach(configName => {
      assert.equal(configName.indexOf("react-native-animation-linter/"), 0);
      assert.equal(plugin.configs.all.rules[configName], 2);
    });
  });
});
