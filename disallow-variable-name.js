const stylelint = require("stylelint");
const { report, ruleMessages, validateOptions } = stylelint.utils;

const ruleName = "my-test/disallow-variable-name";
const messages = ruleMessages(ruleName, {
  error: (disallowedVariableName) =>
    `The "${disallowedVariableName}" name is disallowed.`,
});

const validationHelpers = {
  isBoolean: (value) => {
    return typeof value === "boolean" || value instanceof Boolean;
  },
  isString: (value) => {
    return typeof value === "string" || value instanceof String;
  },
};

module.exports = stylelint.createPlugin(
  ruleName,
  function ruleFunction(primaryOption, secondaryOption) {
    return function lint(postcssRoot, postcssResult) {
      // Don't lint if the rule isn't enabled
      if (primaryOption !== true) {
        return;
      }

      // Check if the options are valid
      const hasValidOptions = validateOptions(
        postcssResult,
        ruleName,
        {
          actual: primaryOption,
          possible: validationHelpers.isBoolean,
          optional: false,
        },
        {
          actual: secondaryOption,
          possible: {
            variableNames: validationHelpers.isString,
          },
          optional: false,
        }
      );

      // Don't lint if the options aren't valid
      if (!hasValidOptions) {
        return null;
      }

      // Traverse descendant nodes
      // https://postcss.org/api/#atrule-walkdecls
      postcssRoot.walkDecls(
        new RegExp(`^(${secondaryOption.variableNames.join("|")})$`),
        (decl) => {
          report({
            ruleName,
            result: postcssResult,
            message: messages.error(decl.prop),
            node: decl,
          });
        }
      );
    };
  }
);
module.exports.ruleName = ruleName;
module.exports.messages = messages;
