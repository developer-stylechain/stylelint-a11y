import { utils } from 'stylelint';
import isStandardSyntaxRule from 'stylelint/lib/utils/isStandardSyntaxRule';

export const ruleName = 'a11y/font-size-large-enough';

export const messages = utils.ruleMessages(ruleName, {
  expected: selector => `Too small "font-size" in ${selector}`,
});

function check(selector, node) {
  if (node.type !== 'rule') {
    return true;
  }

  const result = node.nodes.some(
    o =>
      o.type === 'decl' &&
      o.prop.toLowerCase() === 'font-size' &&
      (!o.value.toLowerCase().endsWith('px') || parseFloat(o.value) >= 15)
  );

  return result;
}

export default function(actual) {
  return (root, result) => {
    const validOptions = utils.validateOptions(result, ruleName, { actual });

    if (!validOptions || !actual) {
      return;
    }

    root.walk(node => {
      let selector = null;

      if (node.type === 'rule') {
        if (!isStandardSyntaxRule(node)) {
          return;
        }
        selector = node.selector;
      } else if (node.type === 'atrule' && node.name.toLowerCase() === 'page' && node.params) {
        selector = node.params;
      }

      if (!selector) {
        return;
      }

      const isAccepted = check(selector, node);

      if (!isAccepted) {
        utils.report({
          index: node.lastEach,
          message: messages.expected(selector),
          node,
          ruleName,
          result,
        });
      }
    });
  };
}
