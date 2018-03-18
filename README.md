# Gazeall - Run command on folder and file changes

![Travis](https://img.shields.io/travis/rajinder-yadav/gazeall.svg)
![Dependencies](https://david-dm.org/rajinder-yadav/gazeall.svg)
![Version](https://img.shields.io/badge/Gazeall-0.3.2-blue.svg)
![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)
[![Greenkeeper badge](https://badges.greenkeeper.io/rajinder-yadav/gazeall.svg)](https://greenkeeper.io/)

This project was developed in TypeScript with the help of [TSCLI](https://www.npmjs.com/package/tscli)

## Watch and run

![Image of Gazelle](img/gazelle.png)

_Gazeall_ watches files and folders for changes, then leaps to action and executes a command.

_Gazeall_ works both as a CLI tool and equally well running NPM scripts inside `package.json`.

NPM Scripts can be run in parallel or synchronous mode.

## Install

```sh
npm -g install gazeall
```

## Usage

```sh
$ gazeall --help

  Usage: gazeall [options] <file ...>

  Options:

    -h, --help            output usage information
    -V, --version         output the version number
    --run <commands>      run commands then wait for changes to re-run.
    --wait-first          wait first, commands will run on changes.
    --runp-npm <scripts>  npm scripts to run parallel.
    --runs-npm <scripts>  npm scripts to run synchronous.
    --delay <ms>          start delay value in milliseconds.
    --halt-on-error       halt on error.
```

## CLI Examples

The examples below show various ways to run _gazeall_ from the command line.

1. Make sure to place command inside quotes if options are passed or there are multiple commands.
1. When using globs to recurse into sub-folders, make sure to put them inside quotes.

### Run in Node.js watch mode

Running a JavaScript file using Node.js and watching for all file changes.

```sh
gazeall main.js
```

The above syntax is just shorthand for.

```sh
gazeall --run "node main.js" "**/*"
```

### Watch all files and sub-folders

This will run the command and then start to watch file for changes to re-run command.

```sh
gazeall --run "node src/main.js" "src/**/*"
```

### Wait first and run command on change

```sh
gazeall --wait-first --run "node src/main.js" "src/**/*"
```

### Target specific files

```sh
gazeall --run "node src/main.js" index.html src/main.js
```

### Target all JavaScript files under a folder

```sh
gazeall --run "node src/main.js" index.html src/*.js
```

### Running multiple commands

```sh
gazeall --run "tsc src/*.ts && node build/main.js" src/*
```

## NPM script examples

For running NPM scripts, _gazeall_ can run scripts either in _parallel_ or _synchronous_.

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

_gazeall_ runs NPM scripts and watch two folders and their sub-folders.

```js
  "scripts": {
    "build": "gazeall --runp-npm \"build:prod build:compressed\" \"src/**/*\" \"vendor/**/*\""
  }
```

_Note_: We make use of double quote and need to escape them, this is the best practice as single quotes can have problem when used on Windows.
