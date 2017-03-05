import { Gaze } from "gaze";
import { exec } from "child_process";

/**
 * Command types
 */

export interface CommandOptions {
  files: string | string[];
  haltOnError?: boolean;
  run: string;
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
  // console.log( `>> ${ cmd.args }` );
  const gaze = new Gaze( cmd.args );

  // Uncomment for debugging
  // gaze.on( "ready", watcher => {
  //   const watched = gaze.watched();
  //   console.log( watched );
  // } );

  gaze.on( "changed", file => {
    // console.log( `${ file } was changed.` );
    // console.log( `running: ${ cmd.run }` );

    if ( file && file.length > 0 ) {

      exec( cmd.run, ( err, stdout, stderr ) => {
        if ( err && cmd.haltOnError ) {
          throw err;
        }
        if ( stderr ) {
          console.log( `stdout: ${ stderr }` );
        }
        if ( stdout ) {
          console.log( `stderr: ${ stdout }` );
        }
      } ); // exec

    } // if

  } ); // gaze.on

}
