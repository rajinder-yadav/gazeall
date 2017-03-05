"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gaze_1 = require("gaze");
var child_process_1 = require("child_process");
;
/**
 * Run command on file or folder change.
 *
 * @param {Object} cmd
 */
function watchAndRun(cmd) {
    if (!cmd.args || cmd.args.length === 0) {
        console.log("Nothing passed for watch, existing!\nFor usage, type: gazeall --help.");
        process.exit(0);
    }
    // console.log( `>> ${ cmd.args }` );
    var gaze = new gaze_1.Gaze(cmd.args);
    // Uncomment for debugging
    // gaze.on( "ready", watcher => {
    //   const watched = gaze.watched();
    //   console.log( watched );
    // } );
    gaze.on("changed", function (file) {
        // console.log( `${ file } was changed.` );
        // console.log( `running: ${ cmd.run }` );
        if (file && file.length > 0) {
            child_process_1.exec(cmd.run, function (err, stdout, stderr) {
                if (err && cmd.haltOnError) {
                    throw err;
                }
                if (stderr) {
                    console.log("stdout: " + stderr);
                }
                if (stdout) {
                    console.log("stderr: " + stdout);
                }
            }); // exec
        } // if
    }); // gaze.on
}
exports.watchAndRun = watchAndRun;
