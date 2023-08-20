# Gazeall - Run command on folder and file changes

![Travis](https://img.shields.io/travis/rajinder-yadav/gazeall.svg)
![Dependencies](https://david-dm.org/rajinder-yadav/gazeall.svg)
![Version](https://img.shields.io/badge/Gazeall-0.10.5-blue.svg)
![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
[![Greenkeeper badge](https://badges.greenkeeper.io/rajinder-yadav/gazeall.svg)](https://greenkeeper.io/)

This project was developed using TypeScript with the help of [TSCLI](https://www.npmjs.com/package/tscli)

## Watch and run

![Image of Gazelle](img/gazelle.png)

_Gazeall_ watches files and folders for changes, then leaps to action and executes a command.

_Gazeall_ works both as a CLI tool and equally well running NPM scripts inside "__package.json__".

NPM Scripts can be run in parallel or synchronous mode.

## Install

```sh
npm install gazeall
```

## Usage

```sh
$ gazeall -h

Usage: gazeall [options] [files...]

Options:
  -v, --version           output the version number
  -r, --run <command...>  run commands then wait for changes to re-run.
  -w, --watch <files...>  files to watch for change.
  -W, --wait              enter wait, commands will run on changes.
  -p, --npmp <scripts>    NPM scripts to run parallel.
  -s, --npms <scripts>    NPM scripts to run synchronous.
  -d, --delay <ms>        start delay value in milliseconds.
  -H, --halt              halt on error.
  -h, --help              display help for command
```

## CLI Examples

The examples below show various ways to run _gazeall_ from the command line.

1. Make sure to place command inside quotes if options are passed or there are multiple commands.
1. When using globs to recurse into sub-folders, make sure to put them inside quotes.

### Run a program using Node.js

To run a JavaScript file using Node.js and have gazeall monitor all JavaScript file for changes in the current folder and all sub-folders, type the following.

```sh
npx gazeall main.js
```

The above syntax is just shorthand for:

```sh
npx gazeall --run "node main.js" --watch "**/*.js"
```

The following shorthand:

```sh
npx gazeall main.js src bin
```

will expand to:

```sh
npx gazeall --run "node main.js" --watch "src/*" "bin/*"
```

For globs, always put then inside quotes.

```sh
npx gazeall main.js "src/*" "bin/**/*"
```

### Run a program using Node.js from a NPM script

If your project has a "__package.json__" file, and gazeall is run without any arguments from a NPM script like this:

```json
{
  ...
  "main": "server.js",
  "scripts": {
    "start": "gazeall"
  },
  ...
}
```

When "npm start" is typed in the Terminal, gazeall will use the program name from the field "main" specified in package.json.

The same execution logic will be used if you also type, "__npx gazeall__" in the Terminal from the root folder of the project.

The above syntax are just shorthand for:

```sh
gazeall --run "node ${main}" --watch "**/*.js"
```

Where "${main}" is the value of the field main ("server.js" in this example).

### Watch all files and sub-folders

This will run the command and then start to watch files under the "src" sub-folder for changes to re-run command.

```sh
npx gazeall --run "node src/main.js" --watch "src/**/*"
```

This shorthand will watch all files under all sub-folders "**/*".

```sh
npx gazeall --run "node src/main.js"
```

Expands to:

```sh
npx gazeall --run "node src/main.js" --watch "**/*"
```

### Watch all files under multiple sub-folders

This will run the command and then start to watch files for changes under sub-folder "src" and "libs".

```sh
npx gazeall --run "node src/main.js" --watch "src/**/*" "libs/**/*"
```

Alternative, pass watch a space seperated file list.

```sh
npx gazeall --run "node src/main.js" --watch "src/**/* libs/**/*"
```

### Delay running a command

To delay running a command, make use of the "--delay <milliseconds>" flag.

This will delay the execution of the command by 5 seconds.

```sh
npx gazeall --run "node src/main.js" --delay 5000
```

### Wait first and run command on change

Usually Gazeall will execute the command immediately. However you can force it to wait for changes before executing the command. This might come is handy at odd times.

Below command is only executed after changes are detected when the "--wait" flag is used.

```sh
npx gazeall --wait --run "node src/main.js"
```

### Target specific files to watch

Files are separated by a space.

```sh
npx gazeall --run "node src/main.js" --watch index.html src/main.js
```

### Target all JavaScript files under a folder

Always make sure to put globs inside quotes.

```sh
npx gazeall --run "node src/main.js" --watch index.html "src/*.js"
```

### Running multiple commands

Multiple commands, each command and argumets must be surrounded with quotes.

```sh
npx gazeall --run "tsc src/*.ts" "node build/main.js" --watch "src/*" "build/*"
```

## NPM script examples

For running NPM scripts inside package.json, _gazeall_ can run scripts either in _parallel_ or _synchronous_.

* To run in parallel mode, use: `--npmp`.
* To run in synchronous mode, use: `--npms`.

_Note_: You may also use the `--wait` switch when running NPM scripts.

The syntax format is:

```js
gazeall --npmp "scripts..." "watch folders and files"
gazeall --npms "scripts..." "watch folders and files"
```

### Run NPM scripts in synchronous mode

In synchronous mode, _gazeall_ will wait for the running command to complete before running the next command. Here three NPM scripts are run in sequence (build->webinit->webrefresh). The next script is run only after the current script completes.

```js
  "scripts": {
    "webwatch": "gazeall --npms \"build webinit webrefresh\" \"src/**/*\""
  }
```

Here the build script runs and _gazeall_ watches two folders and their sub-folders.

```js
  "scripts": {
    "build": "gazeall --npms \"build\" \"src/**/*\" \"vendor/**/*\""
  }
```

### Run NPM scripts in parallel mode

In parallel mode, all scripts execute one after the other without waiting.

```js
  "scripts": {
    "build": "gazeall --npmp \"run:dev run:test\" \"src/**/*\""
  }
```

_gazeall_ runs NPM scripts and watches two folders and their sub-folders.

```js
  "scripts": {
    "build": "gazeall --npmp \"run:dev run:test\" \"src/**/*\" \"test/**/*\""
  }
```

_Note_: We make use of double quote and need to escape them, this is the best practice as single quotes can have problem when used on Windows.
