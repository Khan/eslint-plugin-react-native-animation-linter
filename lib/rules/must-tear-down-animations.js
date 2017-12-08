/**
 * Attempts to enforce that animations are torn down when component unmounts.
 */
const {astHelpers} = require('../util/animations');

const create = (context) => {

    // TODO(amy): express this in a way where names are scoped
    // within a single component to handle multi-component cases.
    // Using a flat object temporarily to get the simplest cases covered.

    // Stores all animated values that have been set.
    // When an animation is torn down, it is removed.
    const activeAnimations = {};

    /**
     * Report teardown violations (animations that are set but not
     * torn down in componentWillUnmount)
     */
    function reportMissingTeardowns() {
        // Get list of all animated nodes that remain active (not torn down)
        const activeNodes = Object.values(activeAnimations);
        // Iterate through all nodes failing the lint rule
        // and use context.report to surface error to user.
        activeNodes.forEach(node => {
            context.report({
                node: node,
                message: `Must tear down animations when component unmounts`,
            });
        });
    }

    /**
     * Check state initialization. If state is set to an animated value
     * directly we record the animation.
     */
    function checkAnimatedStateInitialization(node) {
        const stateProperty = _getStateInitialization(node);
        if (stateProperty) {
            // If initializing state with an animation directly, record the animation
            const expression = node.value.callee;
            const isAnimation = astHelpers.isAnimationDeclaration(expression);
            if (isAnimation) {
                activeAnimations[stateProperty] = node.value;
            }
        }
    }

    /**
     * Check setState calls. If state is set to an animated value directly,
     * we record the animation.
     */
    function checkSetState(node) {
        const newState = _getStateUpdate(node);
        if (newState) {
            newState.properties.forEach(p => {
                const stateProperty = p.key.name;
                const value = p.value;
                // If setting state to an animation directly, record the animation
                const isAnimation = astHelpers.isAnimationDeclaration(value.callee);
                if (isAnimation) {
                    activeAnimations[stateProperty] = value;
                }
            })
        }
    }

    /**
     * Detect if state is being set via setState (`this.setState({foo: "bar"})`).
     * Returns the new state object.
     */
    function _getStateUpdate(node) {
        if (node.callee && node.callee.property &&
            node.callee.property.name === "setState") {
            // We assume setState always takes a single argument.
            return node.arguments[0];
        }
    }


    /**
     * Checks for different ways of initializing state.
     */
    function _getStateInitialization(node) {
        if (node.parent.type === "ObjectExpression") {
            // Handle ES6 class property declaration
            const objectExpression = node.parent;
            const maybeState = objectExpression.parent;
            if (maybeState.type === "ClassProperty" &&
                maybeState.key.name === "state") {
                return node.key.name;
            }
            // Handle this.state = {} syntax (constructor initialization)
            if (objectExpression.parent.type === "AssignmentExpression") {
                const left = objectExpression.parent.left;
                if (left.object.type == "ThisExpression" &&
                    left.property.name == "state") {
                    return node.key.name;
                }
            }
            // Handle getInitialState syntax
            let currNode = node.parent;
            while (currNode) {
                if (currNode.type === 'FunctionExpression' &&
                    currNode.parent.key.name === "getInitialState") {
                    return node.key.name
                }
                currNode = currNode.parent;
            }
        }
    }

    /**
     * Checks for animation teardowns in componentWillUnmount
     */
    function checkComponentWillUnmountForTeardown(node) {
        if (node.key.name !== "componentWillUnmount") {
            return;
        }
        const statements = node.value.body.body;
        statements.forEach(statement => {
            const isTeardown = astHelpers.isAnimationTeardown(statement)
            if (isTeardown) {
                const propertyName = astHelpers.getAnimationVariable(statement)
                delete activeAnimations[propertyName];
            }
        });
    }

    return {

        MethodDefinition: (node) => {
            // componentWillUnmount can be a method
            checkComponentWillUnmountForTeardown(node);
        },

        Property: (node) => {
            // componentWillUnmount can be a property
            checkComponentWillUnmountForTeardown(node);
            // Animation state can be declared as an object property
            checkAnimatedStateInitialization(node);
        },

        CallExpression: (node) => {
            // Animation state can also be set via setState
            checkSetState(node);
        },

        'Program:exit': () => {
            reportMissingTeardowns();
        }
    }
};

module.exports = {
    meta: {
        docs: {
            description: 'Teardown animations in `componentWillUnmount`',
            category: 'react-native',
            recommended: true,
        },
    },
    create,
}
