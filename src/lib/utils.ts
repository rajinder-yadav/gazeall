"use strict";

import * as path from "path";
import * as fs from "fs";

import { Gaze } from "gaze";
import { exec, execSync, ChildProcess, spawn } from "child_process";
import chalk from "chalk";
// import { config } from "shelljs";

/**
 * Command types
 */
export interface CommandOptions {
  files: string | string[];
  haltOnError?: boolean;
  run?: string;
  waitFirst?: boolean;
  runpNpm?: string;
  runsNpm?: string;
  [ args: string ]: any;
}

/**
 * Current running Child process.
 */
let child_procs: ChildProcess[] = [];

/**
 * Run command on file or folder change.
 * @param {CommandOptions} cmd - The program arguments from commander module.
 * @return {void}
 */
export function watchAndRun( cmd: any ): void {

  try {
    if ( cmd.run && ( !cmd.args || cmd.args.length === 0 ) ) {
      // console.log( "Check 1" );
      // Called with command and no watch files.
      // Default to watch all *.js file in current and all sub-folders.
      cmd.args = "**/*.js";
    } else if ( !cmd.run && cmd.args && cmd.args.length > 0 ) {
      // console.log( "Check 2" );
      // Called with no command, only a watch file.
      // This is the shorthand to run the watch file using Node.js.
      // Default to watch all *.js file in current and all sub-folders.
      cmd.run = `node ${ cmd.args }`;
      cmd.args = "**/*.js";
    } else if ( !cmd.run && ( !cmd.args || cmd.args.length === 0 ) ) {
      // console.log( "Check 3" );
      // Called with no command and no watch files.
      // Try to read filename from package.json
      // The field "main" will be used as the file to execute using Node.js.
      const file = path.join( process.cwd(), "package.json" );
      let stats = fs.statSync( file );

      if ( stats.isFile() ) {
        const data = fs.readFileSync( file );
        const package_json = JSON.parse( data.toString() );

        if ( !package_json.main || package_json.main === "" ) {
          throw new Error( "Field main is missing or empty in package.json" );
        }

        stats = fs.statSync( package_json.main );

        if ( !stats.isFile() ) {
          throw new Error( `File ${ package_json.main } declared in package.json not found.` );
        }
        cmd.run = `node ${ package_json.main }`;
      } else {
        throw new Error( "Missing package.json file, unable to read program name to run using Node.js." );
      }
    }
  } catch ( err ) {
    console.log( chalk.red( "Failed to provide a command to execute." ) );
    console.log( chalk.red( err.message ) );
    process.exit( 1 );
  }

  // Check if we run first or wait first.
  if ( !cmd.waitFirst ) {
    run( cmd );
  }

  const gaze = new Gaze( cmd.args );

  // Uncomment for debugging
  // gaze.on( "ready", watcher => {
  //   const watched = gaze.watched();
  //   console.log( chalk.magenta( watched ) );
  // } );

  gaze.on( "changed", ( file: string ) => {
    stopRunningProcess( child_procs );
    child_procs = [];
    run( cmd );
  } );

}

/**
 * Output error message to terminal.
 * @param err {Error|string} - Error message to be shown.
 * @return {void}
 */
function displayErrorMessage( err: Error | string ) {
  if ( err instanceof Error ) {
    process.stderr.write( chalk.red( err.message ) );
  } else {
    process.stderr.write( chalk.red( err ) );
  }
  process.stderr.write( "\n" );
}

/**
 * Stop running processes.
 * @param procs {ChildProcess} - List of running processes.
 * @return {void}
 */
function stopRunningProcess( procs: ChildProcess[] ) {
  if ( procs && procs.length > 0 ) {
    procs.forEach( ( proc: ChildProcess ) => {
      proc.kill();
    } );
  }
}

/**
 * Execute Child process based on switch used.
 * @param {CommandOptions} cmd - Commander program arguments.
 * @return {void}
 */
function run( cmd: CommandOptions ): void {
  // Only one of the following should run.
  if ( cmd.run ) {
    // Run User supplied command.
    console.log( chalk.blue( `=> Running: ${ cmd.run }, watching ${ cmd.args }` ) );
    runCommand( cmd.run, cmd.haltOnError );
  } else if ( cmd.runpNpm ) {
    // Run NPM scripts in parallel.
    const run_list: string[] = cmd.runpNpm.split( /\s+/ );
    run_list.forEach( ( command: string ) => {
      runNPMCommand( `npm run ${ command }`, cmd.haltOnError );
    } );
  } else if ( cmd.runsNpm ) {
    // Run NPM scripts in sequence.
    const run_list: string[] = cmd.runsNpm.split( /\s+/ );
    run_list.forEach( ( command: string ) => {
      runNPMSyncCommand( `npm run ${ command }`, cmd.haltOnError );
    } );
  } else {
    // Should never get here.
    console.log( chalk.red( "Something went wrong, exiting!" ) );
    process.exit( 1 );
  }

}

/**
 * Child process run in detached mode in their own terminal.
 * @param {string} command - Command executed in a detached Child process.
 * @param {err_halt} boolean - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {void}
 */
function runCommand( command: string, err_halt: boolean ): void {
  const args: string[] = command.split( /\s+/ );
  const cmd: string = args.shift();
  const proc: ChildProcess = spawn( cmd, args, { detached: true } );
  child_procs.push( proc );

  proc.stdout.on( "data", ( data: Buffer ) => {
    process.stdout.write( data.toString() );
  } );

  proc.stderr.on( "data", ( data: Buffer ) => {
    displayErrorMessage( data.toString() );
    if ( err_halt ) {
      stopRunningProcess( child_procs );
      process.stderr.write( chalk.red( "Error! Forked Child process terminating.\n" ) );
      process.exit( 1 );
    }
  } );

  // Uncomment to debug process termination.
  // child_procs.on( "close", code => {
  //   console.log( chalk.red( "TERMINATED: Child process." ) );
  // } );
}

/**
 * Run NPM scripts asynchronously for switch --runp-npm
 * @param {string} command - Command to execute.
 * @param {boolean} err_halt - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {void}
 */
function runNPMCommand( command: string, err_halt: boolean ): void {
  const proc: ChildProcess =
    exec( command, ( err, stdout, stderr ) => {
      if ( err && err_halt ) {
        displayErrorMessage( stderr );
        stopRunningProcess( child_procs );
        process.exit( 1 );
      }
      if ( stderr ) {
        displayErrorMessage( stderr );
        if ( err_halt ) {
          stopRunningProcess( child_procs );
          process.exit( 1 );
        }
        return;
      }
      if ( stdout ) {
        process.stdout.write( stdout );
      }
    } ); // exec
  child_procs.push( proc );
}

/**
 * Run NPM scripts synchronously for switch --runs-npm
 * @param {string} command - Command to execute.
 * @param {boolean} err_halt - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {void}
 */
function runNPMSyncCommand( command: string, err_halt: boolean ): void {
  try {
    const out: Buffer | String = execSync( command );
    if ( out ) {
      process.stdout.write( out.toString() );
    }
  } catch ( err ) {
    displayErrorMessage( err );
    if ( err_halt ) {
      stopRunningProcess( child_procs );
      process.exit( 1 );
    }
  }
}
