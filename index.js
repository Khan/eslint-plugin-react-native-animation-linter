/**
 * Entry point configuration for the react-native animation linter.
 */

const allRules = {
    // Add rules here once they exist!
};

// Set up rules to trigger errors (rather than warnings)
function configureAsError(rules) {
    const result = {};
    for (const key in rules) {
        if (!rules.hasOwnProperty(key)) {
            continue;
        }
        result['react-native-animation-linter/' + key] = 2;
    }
    return result;
}

module.exports = {
    rules: allRules,
    configs: {
        // default "all" configuration treats all rules as errors
        all: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            rules: configureAsError(allRules),
        },
    },
};
