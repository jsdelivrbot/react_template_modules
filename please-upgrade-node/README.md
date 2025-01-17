# Please upgrade Node [![](http://img.shields.io/npm/dm/please-upgrade-node.svg?style=flat)](https://www.npmjs.org/package/please-upgrade-node) [![Build Status](https://travis-ci.org/typicode/please-upgrade-node.svg?branch=master)](https://travis-ci.org/typicode/please-upgrade-node) [![npm](https://img.shields.io/npm/v/please-upgrade-node.svg)](https://www.npmjs.com/package/please-upgrade-node)

> :information_desk_person: show a message to your users to upgrade Node instead of a stacktrace 

It's common for new Node users to miss the `npm` engines warning when installing a CLI. This package displays a beginner-friendly message if their Node version is below the one expected.

```sh
$ node -v
0.12

$ modern-cli
modern-cli requires at least version 6 of Node, please upgrade
```

## Install

```sh
npm install please-upgrade-node
```

```js
#!/usr/bin/env node
const pkg = require('./package.json')
require('please-upgrade-node')(pkg)
// Must run BEFORE requiring other modules
```

```js
// package.json
{
  "bin": "./bin.js",
  "engines": {
    "node": ">=6"
  }
}
```

__Important__: `>=` is the only operator supported by `please-upgrade-node` (e.g. `>=6`, `>=6.0`, `>=6.0.0`).

## Options

You can also pass custom `exitCode` (default: `1`) or `message` function

```js
pleaseUpgradeNode(pkg, {
  exitCode: 0,
  message: function(requiredVersion) {
    return 'Oops, this program requires Node ' + requiredVersion
  }
})
```

__Important__: to keep `message` function compatible with older versions of Node, avoid using ES6 features like `=>` or string interpolation.

## See also

* [pkg-ok](https://github.com/typicode/pkg-ok) - :ok_hand: Prevents publishing a module with bad paths
* [husky](https://github.com/typicode/husky) - :dog: Git hooks made easy
* [update-notifier](https://github.com/yeoman/update-notifier) - Update notifications for your CLI app 

Thanks to [zeit/serve](https://github.com/zeit/serve) for the error message inspiration.

## License

MIT - [Typicode :cactus:](https://github.com/typicode) - [Patreon](https://patreon.com/typicode)
