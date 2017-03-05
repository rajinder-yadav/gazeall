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
    var gaze = new gaze_1.Gaze(cmd.args);
    // Uncomment for debugging
    // gaze.on( "ready", watcher => {
    //   const watched = gaze.watched();
    //   console.log( watched );
    // } );
    gaze.on("changed", function (file) {
        if (cmd.run) {
            runCommand(cmd.run, cmd.haltOnError);
        }
        if (cmd.runpNpm) {
            var run_list = cmd.runpNpm.split(/\s+/);
            run_list.forEach(function (command) {
                runCommand("npm run " + command, cmd.haltOnError);
            });
        }
        if (cmd.runsNpm) {
            var run_list = cmd.runsNpm.split(/\s+/);
            run_list.forEach(function (command) {
                runSyncCommand("npm run " + command, cmd.haltOnError);
            });
        }
    }); // gaze.on
}
exports.watchAndRun = watchAndRun;
function runCommand(command, err_halt) {
    child_process_1.exec(command, function (err, stdout, stderr) {
        if (err && err_halt) {
            throw err;
        }
        if (stderr) {
            console.log("stdout: " + stderr);
        }
        if (stdout) {
            console.log("stderr: " + stdout);
        }
    }); // exec
}
function runSyncCommand(command, err_halt) {
    try {
        var out = child_process_1.execSync(command);
        if (out) {
            console.log("stdout: " + out);
        }
    }
    catch (err) {
        if (err_halt) {
            throw err;
        }
    }
}
