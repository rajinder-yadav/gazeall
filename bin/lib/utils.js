"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gaze_1 = require("gaze");
var child_process_1 = require("child_process");
;
/**
 * Current running Child process.
 */
var running_process;
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
    // Check if we run first or wait first.
    if (cmd.run && !cmd.waitRun) {
        run(cmd);
    }
    else {
        cmd.run = cmd.waitRun;
    }
    var gaze = new gaze_1.Gaze(cmd.args);
    // Uncomment for debugging
    // gaze.on( "ready", watcher => {
    //   const watched = gaze.watched();
    //   console.log( watched );
    // } );
    gaze.on("changed", function (file) {
        if (running_process) {
            running_process.kill();
            running_process = undefined;
        }
        run(cmd);
    });
}
exports.watchAndRun = watchAndRun;
/**
 * Execute Child process based on switch used.
 * @param cmd - Commanded program argument.
 */
function run(cmd) {
    // Only one of the following with run.
    if (cmd.run) {
        runCommand(cmd.run, cmd.haltOnError);
    }
    if (cmd.runpNpm) {
        var run_list = cmd.runpNpm.split(/\s+/);
        run_list.forEach(function (command) {
            runNPMCommand("npm run " + command, cmd.haltOnError);
        });
    }
    if (cmd.runsNpm) {
        var run_list = cmd.runsNpm.split(/\s+/);
        run_list.forEach(function (command) {
            runNPMSyncCommand("npm run " + command, cmd.haltOnError);
        });
    }
}
/**
 *
 * @param command: string - Command executed in a detached Child process.
 * @param err_halt: boolean - true will exit of error.
 */
function runCommand(command, err_halt) {
    var args = command.split(/\s+/);
    var proc = args.shift();
    running_process = child_process_1.spawn(proc, args, { detached: true });
    running_process.stdout.on("data", function (data) {
        console.log(data.toString());
    });
    running_process.stderr.on("data", function (data) {
        console.log(data);
        if (err_halt) {
            console.log("Error! Forked Child process terminating");
            console.log(data.toString());
            process.exit(1);
        }
    });
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
function runNPMCommand(command, err_halt) {
    child_process_1.exec(command, function (err, stdout, stderr) {
        if (err && err_halt) {
            throw err;
        }
        if (stderr) {
            console.log(stderr);
            return;
        }
        if (stdout) {
            console.log(stdout);
        }
    }); // exec
}
/**
 * Run NPM scripts synchronously for switch --runs-npm
 * @param command: string - Command to executed
 * @param err_halt: boolean - true will exit on error.
 */
function runNPMSyncCommand(command, err_halt) {
    try {
        var out = child_process_1.execSync(command);
        if (out) {
            console.log(out);
        }
    }
    catch (err) {
        if (err_halt) {
            throw err;
        }
    }
}
