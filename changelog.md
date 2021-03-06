# Change Log

All changes to this project will be recorded in this document.

## 0.8.0 (2019-01-24)

- Added support to stop all launched running process when CTRL+C is pressed.

## 0.7.1 (2019-01-27)

- Fix, when no watch files are passed, but the --run switch is use. Gazeall will default to monitoring all files is all sub-folders. This is a change from monitoring only "*.js" files.

## 0.6.3 (2019-01-24)

- Bug fix, command and watchfile determination for Node.js shortform execution.

## 0.6.0 (2019-01-24)

- Now when no filename is provided, package.json is used to determine the program to run using Node.js.
- Displaying what files are being watched in the output.
- Fixed version number in help Usage output.

## 0.5.2 (2019-01-24)

- Swithced to using process.stdout for child process output to eliminate the extra newline.
- Updated NPM modules.

## 0.3.7 (2018-03-24)

- Bug fix, fixed slow start for Node.js mode, now runs code immediately.

## 0.3.3 (2018-03-17)

- Added support to run a JavaScript file using Node.js and watch for all file changes.
- Text output to console in now colourized.

## 0.2.10 (2018-03-14)

- NPM package update.

## 0.2.5 (2017-03-14)

- Version bump to update README in NPM release.

## 0.2.4 (2017-03-14)

- Fixed TypeScript variable `undefined` crash by initializing it.

## 0.2.3 (2017-03-14)

- Fixed how child processes get terminated.
- Fixed command output for `--runs-npm` switch.
- Fixed `--wait-first` so NPM script command also work.

## 0.2.2 (2017-03-14)

### Breaking Chanage

  Command switch `--wait-run` removed in favour of general `--wait-first`. This means if you are using `--wait-run`, it will need to change to `--run` plus you will need to add `--wait-first` to get the same behaviour. This change makes is possible to use `--wait-first` switch when running NPM scripts.

## 0.2.1 (2017-03-14)

- Fixed error ouput for `--run`, raw Buffer was getting displayed.
- Fixed usage message.
- Switch to no implicit any for TypeScript.
- Add new search keywords for NPM module.

## 0.2.0 (2017-03-11)

- Fixed process execution for `--run`, now correctly run process a detched Child.
- Changed behaviour, switch `--run` now runs commands first then waits for updates.
- New switch `--wait-run`, will wait first then run commands on updates.
- Convets string to integer when value passed using switch `--delay`.
- Now terminates previous launched Child process if still running before re-running commands.

## 0.1.5 (2017-03-11)

- Cleaned up how executed process result is display.
- Fixed a minor display issue of displaying both stderr and stdout.

## 0.1.5 (2017-03-05)

- Added support to run NPM script in parallel and synchronous mode.
- Updated README with section on running NPM scripts.

## 0.1.4 (2017-03-05)

- Added support for running NPM Script.

## 0.1.0 (2017-03-05)

- This is the first working official release.
- Removed debug logging.

## 0.0.1 (2017-03-05)

- Project based off [watch-run](https://www.npmjs.com/package/watch-run), re-written in TypeScript.
