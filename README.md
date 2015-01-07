# gobble-node-server

Fire up your node app and automatically restart it when the underlying source changes. This pairs nicely with the [6to5](http://6to5.org) [plugin](http://github.com/gobblejs/gobble-6to5) to give you decent ES6 support along with auto-reloading on changes.

## Installation

First, you need to have gobble installed - see the [gobble readme](https://github.com/gobblejs/gobble) for details. Then, simply reference `'node-server'` in a `transform`, and gobble will take care of getting the plugin installed.

## Usage

node-server masquerades as a directory transformer, but what it actually does is launch the node script that you specify in the output of its upstream. This should be the last step in a chain, as it does not deposit any files into its destination directory.

If your `gobblefile.js` changes and gobble reloads, node-server will be reloaded and lose its handle on the last running server. In this case, it will attempt to kill the old server by PID before continuing. This seems to work fairly well on Unixen, but it may not work at all on Windows.

STDOUT and STDERR from the spawned process will be automatically dumped to the console using `console.log`.

```js
gobble(builtSource).transform('node-server', { entry: 'app.js', flags: ['--harmony'], appflags: ['--foo'] });
```

### Options
* `entry` - the script to pass to the spawned node to start the app
* `flags` - an array of arguments to pass to the spawned node
* `appflags` - an array of arguments to pass to the spawned node after the script
* `exec` - defaults to `process.execPath` - the executable to launch with the given flags and entry
* `timeout` - defaults to 1000 - the number of milliseconds to wait to finish this phase. If the spawned process exits before this timeout has elapsed you will be warned that it looks like your app died unexpectedly and this phase will die.
* `init` - function - a function that receives the options object that is used for node-server so that you can change settings and flags based on environment, calculated paths, etc.

## License

Copyright (c) 2014 Chris Reeves. Released under an [MIT license](https://github.com/evs-chris/gobble-giblets/blob/master/LICENSE.md).
