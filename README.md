# Gazeall - Run command on folder and file changes

![Travis](https://img.shields.io/travis/rajinder-yadav/gazeall.svg)
![Dependencies](https://david-dm.org/rajinder-yadav/gazeall.svg)
![Version](https://img.shields.io/badge/gazeall-0.0.1-blue.svg)
![License](https://img.shields.io/badge/TSCLI-GPL--3.0-blue.svg)

This project is based off [watch-run](https://www.npmjs.com/package/watch-run), it is completely re-written in TypeScript using [TSCLI](https://github.com/rajinder-yadav/tscli), response time is lightening-fast.

## Watch and run!

![Image of Gazelle](img/gazelle.png)

Gazeall watches files and folders for changes, then leaps to action and execute a command.

## Install

```sh
npm -g install gazeall
```

## Usage

```sh
gazeall --help

  Usage: gazeall [options] <file ...>

  Options:

    -h, --help       output usage information
    -V, --version    output the version number
    --run <command>  command to run.
    --halt-on-error  halt on error.
    --delay <ms>     delay value in milliseconds.
```

### Examples

Run `ls -l` command when any file under folder, `src/` its folders change. Make sure you place command inside quotes if options are passed or there are multiple commands.

When using globs to recurse into sub-folders, make sure to put them inside quotes.

```sh
gazeall --run "ls -l" "src/**/*"
```

Target specific files.

```sh
gazeall --run "ls -l" index.html src/main.ts
```

Target all JavaScript files under `src/` folder.

```sh
gazeall --run "ls -l" src/*.ts
```
