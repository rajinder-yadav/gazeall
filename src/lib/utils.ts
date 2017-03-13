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
 * @param {Object} cmd
 */
export function watchAndRun( cmd: CommandOptions ): void {
  if ( !cmd.args || cmd.args.length === 0 ) {
    console.log( "Nothing passed for watch, existing!\nFor usage, type: gazeall --help." );
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

  gaze.on( "changed", file => {
    if ( running_process ) {
      running_process.kill();
      running_process = undefined;
    }
    run( cmd );
  } );

}

/**
 * Execute Child process based on switch used.
 * @param cmd - Commanded program argument.
 */
function run( cmd: CommandOptions ): void {
  // Only one of the following with run.
  if ( cmd.run ) {
    runCommand( cmd.run, cmd.haltOnError );
  }

  if ( cmd.runpNpm ) {
    const run_list = cmd.runpNpm.split( /\s+/ );
    run_list.forEach( command => {
      runNPMCommand( `npm run ${ command }`, cmd.haltOnError );
    } );
  }

  if ( cmd.runsNpm ) {
    const run_list = cmd.runsNpm.split( /\s+/ );
    run_list.forEach( command => {
      runNPMSyncCommand( `npm run ${ command }`, cmd.haltOnError );
    } );
  }
}

/**
 *
 * @param command: string - Command executed in a detached Child process.
 * @param err_halt: boolean - true will exit of error.
 */
function runCommand( command: string, err_halt: boolean ) {
  const args = command.split( /\s+/ );
  const proc = args.shift();
  running_process = spawn( proc, args, { detached: true } );

  running_process.stdout.on( "data", data => {
    console.log( data.toString() );
  } );

  running_process.stderr.on( "data", data => {
    console.log( data );
    if ( err_halt ) {
      console.log( "Error! Forked Child process terminating" );
      console.log( data.toString() );
      process.exit( 1 );
    }
  } );

  // Uncomment to debug process termination.
  // running_process.on( "close", code => {
  //   console.log( "TERMINATED" );
  // } );
}

/**
 * Run NPM scripts asynchronously for switch --runp-npm
 * @param command: string - Command to executed
 * @param err_halt: boolean - true will exit on error.
 */
function runNPMCommand( command: string, err_halt: boolean ) {
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
 * @param command: string - Command to executed
 * @param err_halt: boolean - true will exit on error.
 */
function runNPMSyncCommand( command: string, err_halt: boolean ) {
  try {
    const out = execSync( command );
    if ( out ) {
      console.log( out );
    }
  } catch ( err ) {
    if ( err_halt ) {
      throw err;
    }
  }
}
