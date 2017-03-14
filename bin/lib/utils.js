"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gaze_1 = require("gaze");
var child_process_1 = require("child_process");
;
var running_process;
function watchAndRun(cmd) {
    if (!cmd.args || cmd.args.length === 0) {
        console.log("Nothing passed to watch, exiting!\nFor usage, type: gazeall --help.");
        process.exit(0);
    }
    if (cmd.run && !cmd.waitRun) {
        run(cmd);
    }
    else {
        cmd.run = cmd.waitRun;
    }
    var gaze = new gaze_1.Gaze(cmd.args);
    gaze.on("changed", function (file) {
        if (running_process) {
            running_process.kill();
            running_process = undefined;
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
    var proc = args.shift();
    running_process = child_process_1.spawn(proc, args, { detached: true });
    running_process.stdout.on("data", function (data) {
        console.log(data.toString());
    });
    running_process.stderr.on("data", function (data) {
        console.log(data.toString());
        if (err_halt) {
            console.log("Error! Forked Child process terminating.");
            process.exit(1);
        }
    });
}
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
    });
}
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
