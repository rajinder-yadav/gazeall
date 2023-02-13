#!/usr/bin/env node
'use strict';

import process from 'node:process';

import {Command} from 'commander';
import {watchAndRun, StopLaunchedProcesses} from './lib/utils';

/** Handle signal when User pressed CTRL+C to stop gazeall.*/
process.on('SIGINT', function (code) {
  StopLaunchedProcesses();
  process.exit(0);
});

const cmd = new Command();

/** Command options. */
cmd
  .version('0.9.0', '-v, --version')
  .usage('[options] [files...]')
  .option('--run <command...>', 'run commands then wait for changes to re-run.')
  .option('--watch <files...>', 'files to watch for change.')
  .option('--wait', 'enter wait, commands will run on changes.')
  .option('--npmp "scripts"', 'NPM scripts to run parallel.')
  .option('--npms "scripts"', 'NPM scripts to run synchronous.')
  .option('--delay <ms>', 'start delay value in milliseconds.')
  .option('--halt', 'halt on error.')
  .parse(process.argv);

const options = cmd.opts();
options.files = process.argv.slice(2);
console.log('debug [options]> ', options);

/** Start watching after delay interval or next event loop if value not provided. */
setTimeout(() => {
  watchAndRun(options);
}, parseInt(options['delay']) || 0);
