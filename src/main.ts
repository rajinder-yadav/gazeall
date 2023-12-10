#!/usr/bin/env node
'use strict';

import process from 'node:process';

import {Command} from 'commander';
import {
  watchAndRun,
  StopLaunchedProcesses,
  readPackageJSONProperties,
} from './lib/gazeall';

/** Handle signal when User pressed CTRL+C to stop gazeall.*/
process.on('SIGINT', function (code) {
  StopLaunchedProcesses();
  process.exit(0);
});

const cmd = new Command();

/** Command options. */
cmd
  .version('gazeall version: 0.13.8', '-v, --version')
  .usage('[options] [files...]')
  .option(
    '-r, --run <command...>',
    'run commands then wait for changes to re-run',
  )
  .option('-w, --watch <files...>', 'files to watch for change')
  .option('-W, --wait', 'enter wait, commands will run on changes')
  .option('-p, --npmp <scripts>', 'NPM scripts to run parallel')
  .option('-s, --npms <scripts>', 'NPM scripts to run synchronous')
  .option('-d, --delay <ms>', 'start delay value in milliseconds')
  .option('-H, --halt', 'halt on error')
  .option('-V, --verbose', 'verbose logging')
  .parse(process.argv);

const options = cmd.opts();
options.args = cmd.args;
// console.log('debug [options]> ', options); // !debug
// console.log('debug [cmd.args]> ', cmd.args); // !debug

options.PACKAGE_JSON = readPackageJSONProperties();

/** Start watching after delay interval or next event loop if value not provided. */
setTimeout(
  () => {
    watchAndRun(options);
  },
  parseInt(options['delay']) || 0,
);
