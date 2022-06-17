const { lint } = require("stylelint");
const { messages, ruleName } = require("./disallow-variable-name");

const generateConfigForTest = (options) => ({
  plugins: ["./disallow-variable-name.js"],
  rules: {
    [ruleName]: options,
  },
});

describe(ruleName, () => {
  test.each([generateConfigForTest([true]), generateConfigForTest([true, {}])])(
    "%j is invalid config",
    async function (config) {
      const {
        results: [{ invalidOptionWarnings, errored }],
      } = await lint({
        code: ".test { --variable-name: red; color: var(--variable-name); }",
        config,
      });

      expect(invalidOptionWarnings).toHaveLength(1);
      expect(invalidOptionWarnings[0].text).toBe(
        `Expected option value for rule "${ruleName}"`
      );
      expect(errored).toBe(true);
    }
  );

  test("disallows a specified variable name", async () => {
    const testVariableNames = ["--disallowed-variable-name"];
    const testCode =
      ".test { --disallowed-variable-name: red;  --allowed-variable-name: green; color: var(--variable-name); }";
    const {
      results: [{ warnings, parseErrors }],
    } = await lint({
      code: testCode,
      config: generateConfigForTest([
        true,
        { variableNames: testVariableNames },
      ]),
    });

    expect(warnings).toHaveLength(testVariableNames.length);
    expect(parseErrors).toHaveLength(0);

    const [{ column, line, text }] = warnings;
    expect(column).toBe(testCode.indexOf(testVariableNames[0]) + 1);
    expect(line).toBe(1);
    expect(text).toBe(messages.error(testVariableNames[0]));
  });
});
