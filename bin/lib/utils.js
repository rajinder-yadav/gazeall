"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gaze_1 = require("gaze");
var child_process_1 = require("child_process");
;
var child_procs = [];
function watchAndRun(cmd) {
    if (!cmd.args || cmd.args.length === 0) {
        console.log("Nothing passed to watch, exiting!\nFor usage, type: gazeall --help.");
        process.exit(0);
    }
    if (!cmd.waitFirst) {
        run(cmd);
    }
    var gaze = new gaze_1.Gaze(cmd.args);
    gaze.on("changed", function (file) {
        if (child_procs) {
            child_procs.forEach(function (proc) {
                proc.kill();
            });
            child_procs = [];
        }
        run(cmd);
    });
}
exports.watchAndRun = watchAndRun;
function run(cmd) {
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
function runCommand(command, err_halt) {
    var args = command.split(/\s+/);
    var cmd = args.shift();
    var proc = child_process_1.spawn(cmd, args, { detached: true });
    child_procs.push(proc);
    proc.stdout.on("data", function (data) {
        console.log(data.toString());
    });
    proc.stderr.on("data", function (data) {
        console.log(data.toString());
        if (err_halt) {
            console.log("Error! Forked Child process terminating.");
            process.exit(1);
        }
    });
}
function runNPMCommand(command, err_halt) {
    var proc = child_process_1.exec(command, function (err, stdout, stderr) {
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
    });
    child_procs.push(proc);
}
function runNPMSyncCommand(command, err_halt) {
    try {
        var out = child_process_1.execSync(command);
        if (out) {
            console.log(out.toString());
        }
    }
    catch (err) {
        if (err_halt) {
            throw err;
        }
    }
}
