#!/usr/bin/env node

import * as cmd from "commander";
import { watchAndRun } from "./lib/utils";

/**
 * Command options.
 */

cmd
  .version( "0.0.3" )
  .usage( "[options] <file ...>" )
  .option( "--run <command>", "command to run." )
  .option( "--halt-on-error", "halt on error." )
  .option( "--delay <ms>", "delay value in milliseconds." )
  .parse( process.argv );

/**
 * Start watching after delay interval or next event loop if value not provided.
 */
setTimeout(() => {
  watchAndRun( cmd );
}, cmd.delay || 0 );
