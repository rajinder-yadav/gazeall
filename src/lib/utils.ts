import { Gaze } from "gaze";
import { exec } from "child_process";

/**
 * Command types
 */

export interface CommandOptions {
  files: string | string[];
  haltOnError?: boolean;
  run?: string;
  runNpm?: string;
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

    if ( cmd.run && !cmd.runNpm ) {
      runCommand( cmd.run, cmd.haltOnError );
    }

    if ( !cmd.run && cmd.runNpm ) {
      const run_list = cmd.runNpm.split( /\s+/ );
      run_list.forEach( command => {
        runCommand( `npm run ${ command }`, cmd.haltOnError );
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
      console.log( `stdout: ${ stderr }` );
    }
    if ( stdout ) {
      console.log( `stderr: ${ stdout }` );
    }
  } ); // exec
}
