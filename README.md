# Gazeall - Run command on folder and file changes

![Travis](https://img.shields.io/travis/rajinder-yadav/gazeall.svg)
![Dependencies](https://david-dm.org/rajinder-yadav/gazeall.svg)
![Version](https://img.shields.io/badge/Gazeall-0.7.0-blue.svg)
![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
[![Greenkeeper badge](https://badges.greenkeeper.io/rajinder-yadav/gazeall.svg)](https://greenkeeper.io/)

This project was developed in TypeScript with the help of [TSCLI](https://www.npmjs.com/package/tscli)

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
$ gazeall --help

Usage: gazeall [options] [file, ...]

Options:
  -v, --version         output the version number
  --run <commands>      run commands then wait for changes to re-run.
  --wait-first          wait first, commands will run on changes.
  --runp-npm <scripts>  NPM scripts to run parallel.
  --runs-npm <scripts>  NPM scripts to run synchronous.
  --delay <ms>          start delay value in milliseconds.
  --halt-on-error       halt on error.
  -h, --help            output usage information
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
npx gazeall --run "node main.js" "**/*.js"
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
gazeall --run "node ${main}" "**/*.js"
```

Where "${main}" is the value of the field main ("server.js" in this example).

### Watch all files and sub-folders

This will run the command and then start to watch files under the "src" sub-folder for changes to re-run command.

```sh
npx gazeall --run "node src/main.js" "src/**/*"
```

### Watch all files under multiple sub-folders

This will run the command and then start to watch files for changes under sub-folder "src" and "libs" to re-run command.

```sh
npx gazeall --run "node src/main.js" "src/**/*" "libs/**/*"
```

### Wait first and run command on change

This command is only be execute after changes are detected.

```sh
npx gazeall --wait-first --run "node src/main.js" "src/**/*"
```

### Target specific files to watch

Files are separated by a space.

```sh
npx gazeall --run "node src/main.js" index.html src/main.js
```

### Target all JavaScript files under a folder

Always make sure to put globs inside quotes.

```sh
npx gazeall --run "node src/main.js" index.html "src/*.js"
```

### Running multiple commands

Multiple commands are chained using "&&" and surrounded with quotes.

```sh
npx gazeall --run "tsc src/*.ts && node build/main.js" "src/*"
```

## NPM script examples

For running NPM scripts inside package.json, _gazeall_ can run scripts either in _parallel_ or _synchronous_.

* To run in parallel mode, use: `--runp-npm`.
* To run in synchronous mode, use: `--runs-npm`.

_Note_: You may also use the `--wait-first` switch when running NPM scripts.

### Run NPM scripts in synchronous mode

In synchronous mode, _gazeall_ will wait for the running command to complete before running the next command.

```js
  "scripts": {
    "webwatch": "gazeall --runs-npm \"build webinit webrefresh\" \"src/**/*\""
  }
```

Here the build script runs and _gazeall_ watches two folders and their sub-folders.

```js
  "scripts": {
    "build": "gazeall --runs-npm \"build\" \"src/**/*\" \"vendor/**/*\""
  }
```

### Run NPM scripts in parallel mode

In parallel mode, all scripts execute one after the other without waiting.

```js
  "scripts": {
    "build": "gazeall --runp-npm \"build:prod build:compressed\" \"src/**/*\""
  }
```

_gazeall_ runs NPM scripts and watches two folders and their sub-folders.

```js
  "scripts": {
    "build": "gazeall --runp-npm \"build:prod build:compressed\" \"src/**/*\" \"vendor/**/*\""
  }
```

_Note_: We make use of double quote and need to escape them, this is the best practice as single quotes can have problem when used on Windows.
