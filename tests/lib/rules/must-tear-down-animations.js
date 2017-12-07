/**
 * Test for must-tear-down-animations rule.
 */

// TODO(amy): create this rule!
const rule = require('../../../lib/rules/must-tear-down-animations');
const RuleTester = require('eslint').RuleTester;

require('babel-eslint');

const ruleTester = new RuleTester();

const tests = {

    valid: [
        {
            // Animated value is set via class property declaraction, and is
            // properly torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                state = {
                    color: new Animated.Value(0),
                    height: 100,
                };
                componentWillUnmount() {
                    this.state.color.stopAnimation();
                }
                render() {
                    return <Animated.View/>;
                }
            }`,
        },
        {
            // Animated value is set via setState (directly provided as arg)
            // and is torn down properly.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                state = {
                    color: null,
                };
                onClick() {
                    this.setState({color: new Animated.Value(0)})
                }
                componentWillUnmount() {
                    this.state.color.stopAnimation();
                }
                render() {
                    return <Animated.View/>;
                }
            }`,
        },
        {
            // Animated value is set via getInitialState and is torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            const Hello = React.createClass({
                getInitialState() {
                    return {
                        color: new Animated.Value(0),
                        height: 100,
                    };
                },
                componentWillUnmount() {
                    this.state.color.stopAnimation();
                },
                render() {
                    return <Animated.View/>;
                }
            });`,
        },
        {
            // Animated value is set via variable in getInitialState and is torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            const Hello = React.createClass({
                getInitialState() {
                    const animatedValue = new Animated.Value(0)
                    return {
                        color: animatedValue,
                    };
                },
                componentWillUnmount() {
                    this.state.color.stopAnimation();
                },
                render() {
                    return <Animated.View/>;
                }
            });`,
        },
        {
            // Two animated variables are set and both are torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                state = {
                    color: new Animated.Value(0),
                    size: new Animated.Value(0)
                }
                componentWillUnmount() {
                    this.state.color.stopAnimation();
                    this.state.size.stopAnimation();
                }
                render() {
                    return <Animated.View />;
                }
            }`,
        },
        {
            // Edge-case: A variable called `color` is set to an animated value.
            // Elsewhere, a variable called `color` is set to component state.
            // (but animated variable is never set to component state). There
            // should be no error even though there's no teardown.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                constructor(props) {
                    super();
                    const color = "foo";
                    this.state = {
                        color: color,
                    };
                }
                onClick() {
                    const color = new Animated.Value(0);
                }
                render() {
                    return <Animated.View/>;
                }
            }`,
        },
        {
            // Animated state is set via a click handler with a variable
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            const Hello = React.createClass({
                getInitialState() {
                    return {
                         color: null,
                    };
                },
                onClick() {
                    const foo = new Animated.Value(0);
                    this.setState({color: foo})
                },
                componentWillUnmount() {
                    this.state.color.stopAnimation();
                },
                render() {
                    return <Animated.View/>;
                },
            });`,
        },
        {
            // Animated is imported from something sneaky, not react-native.
            // It's okay that we don't tear it down!
            code: `
            const React = require('react');
            const {Animated} = require('my-animation-library');
            export default class MyComponent extends React.Component {
                state = {
                    color: new Animated.Value(0),
                    height: 100,
                };
                render() {
                    return <Animated.View/>;
                }
           }`,
        },
        {
            // Animated state is extracted from state before torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                state = {
                    color: new Animated.Value(0),
                };
                componentWillUnmount() {
                    const {color} = this.state;
                    color.stopAnimation();
                }
                render() {
                    return <Animated.View/>;
                }
            }`,
        },
        {
            // Multi-component case (both components have animations torn down)
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            class MyComponent extends React.Component {
                state = {
                    color: new Animated.Value(0)
                }
                componentWillUnmount() {
                    this.state.color.stopAnimation();
                }
                render() {
                    return <Animated.View/>;
                }
            }
            export default class MyOtherComponent extends React.Component {
                state = {
                   color: new Animated.Value(0),
                };
                componentWillUnmount() {
                    this.state.color.stopAnimation();
                }
                render() {
                     return <Animated.View/>;
                }
            }`,
        },
    ],
    invalid: [
        {
            // Animated state is set via class property declaration and
            // is not torn down properly.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                state = {
                    color: new Animated.Value(0),
                };
                render() {
                    return <Animated.View/>
                }
            }`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Animated state is set via setState but is not torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                state = {
                    color: null,
                };
                componentDidMount() {
                    this.setState({color: new Animated.Value(0)})
                }
                render() {
                    return <Animated.View/>
                }
            }`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Animated state is set via getInitialState and not torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            const Hello = React.createClass({
                getInitialState() {
                    return {
                        color: new Animated.Value(0),
                    };
                },
                render() {
                    return <Animated.View />;
                }
            });`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Animated state is set directly in constructor and not torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                constructor(props) {
                    super();
                    this.state = {
                        size: new Animated.Value(0),
                    };
                }
                render() {
                    return <Animated.View />;
                }
            }`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Animated state is set via getInitialState (via a variable)
            // and is not torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            const Hello = React.createClass({
                getInitialState() {
                    return {
                        color: new Animated.Value(0),
                    };
                },
                render() {
                    return <Animated.View />;
                }
            });`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Animated state is set via setState with a variable and not torn down
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            const Hello = React.createClass({
                onClick() {
                    const foo = new Animated.Value(0);
                    this.setState({color: foo})
                },
                render() {
                    return <Animated.View />;
                }
            });`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Animated state is initialized to non-animated value,
            // then set to animated value later via variable.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            const Hello = React.createClass({
                getInitialState() {
                    return {
                        color: "red",
                    };
                },
                onClick() {
                    const color = new Animated.Value(0);
                    this.setState({foo: "bar", color})
                },
                render() {
                    return <Animated.View />;
                }
            });`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Animated state is set via variable in constructor and not torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                constructor(props) {
                    super();
                    const animatedColor = new Animated.Value(0);
                    this.state = {
                       height: 100,
                       color: animatedColor,
                    };
                }
                render() {
                    return <Animated.View />;
                }
            }`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Two animated variables are set and only one is torn down.
            code: `
            const React = require('react');
            const {Animated} = require('react-native');
            export default class MyComponent extends React.Component {
                state = {
                    color: new Animated.Value(0),
                    size: new Animated.Value(0)
                }
                componentWillUnmount() {
                     this.state.color.stopAnimation();
                }
                render() {
                    return <Animated.View />;
                }
            }`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
        {
            // Multi-component case (only one of the animations is torn down)
            code: `
                const React = require('react');
                const {Animated} = require('react-native');
                class MyComponent extends React.Component {
                    state = {
                        color: new Animated.Value(0)
                    }
                    componentWillUnmount() {
                        this.state.color.stopAnimation();
                    }
                    render() {
                        return <Animated.View/>;
                    }
                }
                export default class MyOtherComponent extends React.Component {
                state = {
                    color: new Animated.Value(0),
                };
                render() {
                    return <Animated.View/>;
                }
            }`,
            errors: [{
                message: 'Must tear down animations when component unmounts',
            }],
        },
    ],
};

const config = {
  parser: 'babel-eslint',
  parserOptions: {
    ecmaFeatures: {
      classes: true,
      jsx: true,
    },
  },
};

tests.valid.forEach(t => Object.assign(t, config));
tests.invalid.forEach(t => Object.assign(t, config));

ruleTester.run('must-tear-down-animations', rule, tests);
