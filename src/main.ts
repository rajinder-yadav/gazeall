#!/usr/bin/env node

import * as cmd from "commander";
import { watchAndRun } from "./lib/utils";

/**
 * Command options.
 */

cmd
  .version( "0.1.2" )
  .usage( "[options] <file ...>" )
  .option( "--run <commands>", "commands to run." )
  .option( "--run-npm <scripts>", "npm scripts to run." )
  .option( "--delay <ms>", "delay value in milliseconds." )
  .option( "--halt-on-error", "halt on error." )
  .parse( process.argv );

/**
 * Start watching after delay interval or next event loop if value not provided.
 */
setTimeout(() => {
  watchAndRun( cmd );
}, cmd.delay || 0 );
