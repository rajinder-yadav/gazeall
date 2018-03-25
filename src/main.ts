#!/usr/bin/env node

import * as cmd from "commander";
import { watchAndRun } from "./lib/utils";

/**
 * Command options.
 */
cmd
  .version( "0.3.7", "-v, --version" )
  .usage( "[options] <file ...>" )
  .option( "--run <commands>", "run commands then wait for changes to re-run." )
  .option( "--wait-first", "wait first, commands will run on changes." )
  .option( "--runp-npm <scripts>", "npm scripts to run parallel." )
  .option( "--runs-npm <scripts>", "npm scripts to run synchronous." )
  .option( "--delay <ms>", "start delay value in milliseconds." )
  .option( "--halt-on-error", "halt on error." )
  .parse( process.argv );

/**
 * Start watching after delay interval or next event loop if value not provided.
 */
setTimeout( () => {
  watchAndRun( cmd );
}, parseInt( cmd.delay ) || 0 );
