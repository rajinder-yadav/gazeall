#!/usr/bin/env node
"use strict";

import * as cmd from "commander";
import { watchAndRun, StopLaunchedProcesses } from "./lib/utils";

/**
 * Handle signal when User pressed CTRL+C to stop gazeall.
 */
process.once( "SIGINT", function( code ) {
  StopLaunchedProcesses();
  process.exit( 0 );
} );

/**
 * Command options.
 */
cmd
  .version( "0.8.0", "-v, --version" )
  .usage( "[options] [file,...]" )
  .option( "--run <commands>", "run commands then wait for changes to re-run." )
  .option( "--wait-first", "wait first, commands will run on changes." )
  .option( "--runp-npm <scripts>", "NPM scripts to run parallel." )
  .option( "--runs-npm <scripts>", "NPM scripts to run synchronous." )
  .option( "--delay <ms>", "start delay value in milliseconds." )
  .option( "--halt-on-error", "halt on error." )
  .parse( process.argv );

/**
 * Start watching after delay interval or next event loop if value not provided.
 */
setTimeout( () => {
  watchAndRun( cmd );
}, parseInt( cmd.delay ) || 0 );
