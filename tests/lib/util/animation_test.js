/**
 * Tests for animation utilities
 */

const assert = require('assert');
const espree = require("espree");

const {astHelpers, AnimatedVariables, Teardowns} = require(
    "../../../lib/util/animation.js");

describe('Animated variables', () => {
    it('we should increment animated variables correctly', () => {
        const animatedVariables = new AnimatedVariables();
        assert.equal(Object.keys(animatedVariables.variables).length, 0);
        animatedVariables.register("component-foo", "color")
        assert.equal(Object.keys(animatedVariables.variables).length, 1);
        animatedVariables.register("component-bar", "size")
        assert.equal(Object.keys(animatedVariables.variables).length, 2);
    });
    it('we should increment animation teardowns correctly', () => {
        const teardowns = new Teardowns();
        assert.equal(Object.keys(teardowns.teardowns).length, 0);
        teardowns.register("component-foo", "color")
        assert.equal(Object.keys(teardowns.teardowns).length, 1);
        teardowns.register("component-bar", "size")
        assert.equal(Object.keys(teardowns.teardowns).length, 2);
    });
});


describe('AST helpers', () => {
    it('detect animation creation', () => {
        // This expression doesn't include an animated value
        const nonAnimationSrc = "Animated.OtherThing"
        const nonAnimationNode = espree.parse(nonAnimationSrc).body[0];
        const isNotAnimation = astHelpers.isAnimationDeclaration(
            nonAnimationNode);
        assert.equal(isNotAnimation, false);
        // This expression does include an animated value
        const animationSrc = "Animated.Value";
        const animationNode = espree.parse(animationSrc).body[0];
        const isAnimation = astHelpers.isAnimationDeclaration(
            animationNode.expression);
        assert.equal(isAnimation, true);
    });
    it('Detect animation teardown', () => {
        // This expression doesn't include an animation teardown
        const nonTeardownSrc = "var stopAnimation = 1;";
        const nonTeardownNode = espree.parse(nonTeardownSrc).body[0];
        const shouldNotBeTearDown = astHelpers.isAnimationTeardown(
            nonTeardownNode);
        assert.equal(shouldNotBeTearDown, false);
        // This expression does include an animation teardown
        const teardownSrc = "this.state.color.stopAnimation();";
        const teardownNode = espree.parse(teardownSrc).body[0];
        const shouldBeTearDown = astHelpers.isAnimationTeardown(
            teardownNode);
        assert.equal(shouldBeTearDown, true);
    });
});
