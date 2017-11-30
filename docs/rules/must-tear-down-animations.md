# Detect when animated state is not torn down properly.

React Native apps can crash if an animation continues after a parent component
has unmounted. This lint rule aims to enforce that animations are torn down
during componentWillUnmount to prevent this kind of crash.

## Rule Details

Good:

```js
const React = require('react');
const {Animated} = require('react-native');
export default class MyComponent extends React.Component {
    state = {
        color: new Animated.Value(0),
    };
    componentWillUnmount() {
        this.state.color.stopAnimation();
    }
    render() {
        return <Animated.View
            style={{backgroundColor: this.state.color}}
        />;
    }
}
});
```

Bad:

```js
const React = require('react');
const {Animated} = require('react-native');
export default class MyComponent extends React.Component {
    state = {
        color: new Animated.Value(0),
    };
    someRandomThing() {
        this.state.color.stopAnimation();
    }
    render() {
        return <Animated.View
            style={{backgroundColor: this.state.color}}
        />;
    }
}
});
```

Good:

```js
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
        return <Animated.View
            style={{backgroundColor: this.state.color}}
        />;
    }
}
```
Bad:

```js
const React = require('react');
const {Animated} = require('react-native');
export default class MyComponent extends React.Component {
    state = {
        color: null,
    };
    onClick() {
        this.setState({color: new Animated.Value(0)})
    }
    render() {
        return <Animated.View
            style={{backgroundColor: this.state.color}}
        />;
    }
}
```

Good:

```js
const React = require('react');
const {Animated} = require('react-native');
const Hello = React.createClass({
    getInitialState () {
        return {
            color: new Animated.Value(0),
        };
    },
    componentWillUnmount() {
        this.state.color.stopAnimation();
    },
    render: function() {
        return <Animated.View />;
    }
});
```

Bad:

```js
const React = require('react');
const {Animated} = require('react-native');
const Hello = React.createClass({
    getInitialState () {
        return {
            color: new Animated.Value(0),
        };
    },
    render: function() {
        return <Animated.View />;
    }
});
```