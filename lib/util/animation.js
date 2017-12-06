/**
 * Utilities and data structures for dealing with react-native animated values.
 */

/**
 * Represents all animated variables found in the code, keyed by component.
 */
function AnimatedVariables() {
    this.variables = {};
}

/**
 * Registers an animated variable to our AnimatedVariables collection.
 */
AnimatedVariables.prototype.register = function (componentId, variableName) {
    const variables = this.variables[componentId] || [];
    variables.push(variableName);
    this.variables[componentId] = variables;
};

/**
 * Represents all animation teardowns found in the code, keyed by component.
 */
function Teardowns() {
    this.teardowns = {};
}

/**
 * Registers a animation teardown to our Teardowns collection.
 */
Teardowns.prototype.register = function (componentId, key) {
    const teardowns = this.teardowns[componentId] || [];
    teardowns.push(key);
    this.teardowns[componentId] = teardowns;
};


/**
 * Helper fns for extracting animation information from AST node.
 */
const astHelpers = {
    _containsAnimate: function (node) {
        return Boolean(
            node &&
            node.object &&
            node.object.name === 'Animated'
        );
    },

    _containsAnimateValue: function (node) {
        return Boolean(
            node &&
            node.property &&
            node.property.name === 'Value'
        );
    },

    isAnimationDeclaration: function (node) {
        return Boolean(
            astHelpers._containsAnimate(node) &&
            astHelpers._containsAnimateValue(node)
        );
    },

    isAnimationTeardown: function (node) {
        return Boolean(
            node.expression &&
            node.expression.callee &&
            node.expression.callee.property &&
            node.expression.callee.property.name === "stopAnimation"
        );
    },
    getAnimationVariable: function (node) {
        return node.expression.callee.object.property.name;
    },
};

module.exports = {
    astHelpers,
    ComponentAnimations,
    AnimatedVariables,
    Teardowns,
}
