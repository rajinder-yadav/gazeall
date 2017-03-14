import { Gaze } from "gaze";
import { exec, execSync, ChildProcess, spawn } from "child_process";

/**
 * Command types
 */
export interface CommandOptions {
  files: string | string[];
  haltOnError?: boolean;
  run?: string;
  waitRun?: string;
  runpNpm?: string;
  runsNpm?: string;
  [ args: string ]: any;
};

/**
 * Current running Child process.
 */
let running_process: ChildProcess;

/**
 * Run command on file or folder change.
 *
 * @param {CommandOptions} cmd - The program arguments from commander module.
 * @return {void}
 */
export function watchAndRun( cmd: CommandOptions ): void {
  if ( !cmd.args || cmd.args.length === 0 ) {
    console.log( "Nothing passed to watch, exiting!\nFor usage, type: gazeall --help." );
    process.exit( 0 );
  }

  // Check if we run first or wait first.
  if ( cmd.run && !cmd.waitRun ) {
    run( cmd );
  } else {
    cmd.run = cmd.waitRun;
  }

  const gaze = new Gaze( cmd.args );

  // Uncomment for debugging
  // gaze.on( "ready", watcher => {
  //   const watched = gaze.watched();
  //   console.log( watched );
  // } );

  gaze.on( "changed", ( file: string ) => {
    if ( running_process ) {
      running_process.kill();
      running_process = undefined;
    }
    run( cmd );
  } );

}

/**
 * Execute Child process based on switch used.
 * @param {CommandOptions} cmd - Commander program arguments.
 * @return {void}
 */
function run( cmd: CommandOptions ): void {
  // Only one of the following with run.
  if ( cmd.run ) {
    runCommand( cmd.run, cmd.haltOnError );
  }

  if ( cmd.runpNpm ) {
    const run_list: string[] = cmd.runpNpm.split( /\s+/ );
    run_list.forEach(( command: string ) => {
      runNPMCommand( `npm run ${ command }`, cmd.haltOnError );
    } );
  }

  if ( cmd.runsNpm ) {
    const run_list: string[] = cmd.runsNpm.split( /\s+/ );
    run_list.forEach(( command: string ) => {
      runNPMSyncCommand( `npm run ${ command }`, cmd.haltOnError );
    } );
  }
}

/**
 *
 * @param {string} command - Command executed in a detached Child process.
 * @param {err_halt} boolean - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {void}
 */
function runCommand( command: string, err_halt: boolean ): void {
  const args: string[] = command.split( /\s+/ );
  const proc: string = args.shift();
  running_process = spawn( proc, args, { detached: true } );

  running_process.stdout.on( "data", ( data: Buffer ) => {
    console.log( data.toString() );
  } );

  running_process.stderr.on( "data", ( data: Buffer ) => {
    console.log( data.toString() );
    if ( err_halt ) {
      console.log( "Error! Forked Child process terminating." );
      process.exit( 1 );
    }
  } );

  // Uncomment to debug process termination.
  // running_process.on( "close", code => {
  //   console.log( "TERMINATED: Child process." );
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
  exec( command, ( err, stdout, stderr ) => {
    if ( err && err_halt ) {
      throw err;
    }
    if ( stderr ) {
      console.log( stderr );
      return;
    }
    if ( stdout ) {
      console.log( stdout );
    }
  } ); // exec
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
      console.log( out );
    }
  } catch ( err ) {
    if ( err_halt ) {
      throw err;
    }
  }
}
