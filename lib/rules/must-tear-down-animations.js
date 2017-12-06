/**
 * Attempts to enforce that animations are torn down when component unmounts.
 */

const create = (context) => {

    /**
     * Report teardown violations (animations that are set but not
     * torn down in componentWillUnmount)
     */
    function reportMissingTeardowns(errorNodes) {
        // Iterate through all nodes failing the lint rule
        // and use context.report to surface error to user.
        errorNodes.forEach(node => {
            context.report({
                node: node,
                message: 'Must tear down animation on unmount',
            });
        });
    }
    // List where we will accumulate nodes violating the rule.
    const errorNodes = [];
    return {

        'Program:exit': () => {
            reportMissingTeardowns(errorNodes);
        }
    };
};

module.exports = {
    create,
}
