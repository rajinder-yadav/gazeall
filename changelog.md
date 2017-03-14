# Change Log

All changes to this project will be recorded in this document.

## 0.2.3 (2017-03-14)

* Fixed how child processes get terminated.
* Fixed command output for `--runs-npm` switch.
* Fixed `--wait-first` so NPM script command also work.

## 0.2.2 (2017-03-14)

Breaking Chanage:
  Command switch `--wait-run` removed in favour for general `--wait-first`. This mean if you are using `--wait-run`, this will need to switch to `--run` and you will also need to add `--wait-first` to get the same behaviour. This change makes is possible to do the same when running NPM scripts.

## 0.2.1 (2017-03-14)

* Fixed error ouput for `--run`, raw Buffer was getting displayed.
* Fixed usage message.
* Switch to no implicit any for TypeScript.
* Add new search keywords for NPM module.

## 0.2.0 (2017-03-11)

* Fixed process execution for `--run`, now correctly run process a detched Child.
* Changed behaviour, switch `--run` now runs commands first then waits for updates.
* New switch `--wait-run`, will wait first then run commands on updates.
* Convets string to integer when value passed using switch `--delay`.
* Now terminates previous launched Child process if still running before re-running commands.

## 0.1.5 (2017-03-11)

* Cleaned up how executed process result is display.
* Fixed a minor display issue of displaying both stderr and stdout.

## 0.1.5 (2017-03-05)

* Added support to run NPM script in parallel and synchronous mode.
* Updated README with section on running NPM scripts.


## 0.1.4 (2017-03-05)

* Added support for running NPM Script.

## 0.1.0 (2017-03-05)

* This is the first working official release.
* Removed debug logging.

## 0.0.1 (2017-03-05)

* Project based off [watch-run](https://www.npmjs.com/package/watch-run), re-written in TypeScript.

