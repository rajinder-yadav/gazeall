import { Gaze } from "gaze";
import { exec, execSync } from "child_process";

/**
 * Command types
 */

export interface CommandOptions {
  files: string | string[];
  haltOnError?: boolean;
  run?: string;
  runpNpm?: string;
  runsNpm?: string;
  [ args: string ]: any;
};

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

  const gaze = new Gaze( cmd.args );

  // Uncomment for debugging
  // gaze.on( "ready", watcher => {
  //   const watched = gaze.watched();
  //   console.log( watched );
  // } );

  gaze.on( "changed", file => {

    if ( cmd.run ) {
      runCommand( cmd.run, cmd.haltOnError );
    }

    if ( cmd.runpNpm ) {
      const run_list = cmd.runpNpm.split( /\s+/ );
      run_list.forEach( command => {
        runCommand( `npm run ${ command }`, cmd.haltOnError );
      } );
    }

    if ( cmd.runsNpm ) {
      const run_list = cmd.runsNpm.split( /\s+/ );
      run_list.forEach( command => {
        runSyncCommand( `npm run ${ command }`, cmd.haltOnError );
      } );
    }

  } ); // gaze.on

}

function runCommand( command: string, err_halt: boolean ) {
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


function runSyncCommand( command: string, err_halt: boolean ) {
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
