# Change Log

All changes to this project will be recorded in this document.

## 0.13.1 (2023-12-07)

- Improved default and verbose logging.
- README update on logging.

## 0.13.0 (2023-12-06)

- Fix long standing issues with running command synchronously that would block
  as a result changed detection was broken.

## 0.12.0 (2023-12-01)

- Added a verbose logging flag.
- Fix premature error when loading package.json
- New debug logging

## 0.10.0 (2023-02-17)

- When stopping running process, not show how many to stop.
- Code refactor for strict typechecking using loggical and, or in place of if statement.
- Add option for npm script run (npmp, npms) to provide a watch file list.
- Corrected Commander args not getting passed along with its options.
- Added missing run file checks with error message and clean exit.
- Tidy Error messages.

## 0.9.0 (2023-02-13)

- Improved npm synchronous script execution.
- Improved npm synchronous parallel execution.
- Now showing execution tim on exit.
- Chalk replaced with colour, was giving runtime error.
- "run" now takes multiple commands.
- "runp-npn" changed to "npmp".
- "runsp-npn" changed to "npms".
- "wait-first" changed to "wait".
- "halt-on-error" changed to "halt".
- Fixed multiple errors caused up commander update.
- "watch" accept a list of files or multiple quoted files.
- Wait now accept an integer value.
- Improved "watchAndRun" function.
- Removed eslint for typescript, too many annoying errors.
- Added prettier for code formatting.
- Process name added to output.
- Fixed Linux signal handling for CTRL+C.
- Added terminating process pid, exit code and success, failed console message.

## 0.8.1 (2019-07-03)

- Bug fix, Stack overflow error, and executing the incorrect path. NPM Script not execute correctly also.

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
