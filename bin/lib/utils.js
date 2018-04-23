"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gaze_1 = require("gaze");
var child_process_1 = require("child_process");
var chalk_1 = require("chalk");
var child_procs = [];
function watchAndRun(cmd) {
    if (!cmd.args || cmd.args.length === 0) {
        console.log(chalk_1.default.red("Nothing passed to watch, exiting!\nFor usage, type: gazeall --help."));
        process.exit(0);
    }
    if (!cmd.waitFirst) {
        run(cmd);
    }
    var gaze = new gaze_1.Gaze(cmd.args);
    gaze.on("changed", function (file) {
        terminateChildProcs();
        run(cmd);
    });
    process.on("SIGINT", function () {
        terminateChildProcs();
        process.exit(0);
    });
    process.on("SIGTERM", function () {
        terminateChildProcs();
        process.exit(0);
    });
    process.on("SIGQUIT", function () {
        terminateChildProcs();
        process.exit(0);
    });
}
exports.watchAndRun = watchAndRun;
function terminateChildProcs() {
    if (child_procs) {
        child_procs.forEach(function (proc) {
            proc.kill();
        });
        child_procs = [];
    }
}
function run(cmd) {
    if (cmd.run) {
        console.log(chalk_1.default.blue("=> Running: " + cmd.run));
        runCommand(cmd.run, cmd.haltOnError);
    }
    else if (cmd.runpNpm) {
        var run_list = cmd.runpNpm.split(/\s+/);
        run_list.forEach(function (command) {
            runNPMCommand("npm run " + command, cmd.haltOnError);
        });
    }
    else if (cmd.runsNpm) {
        var run_list = cmd.runsNpm.split(/\s+/);
        run_list.forEach(function (command) {
            runNPMSyncCommand("npm run " + command, cmd.haltOnError);
        });
    }
    else {
        console.log(chalk_1.default.blue("=> Running: node " + cmd.args));
        runCommand("node " + cmd.args, cmd.haltOnError);
    }
}
function runCommand(command, err_halt) {
    var args = command.split(/\s+/);
    var cmd = args.shift();
    var proc = child_process_1.spawn(cmd, args, { detached: true });
    child_procs.push(proc);
    proc.on("exit", function (code) {
        console.log(chalk_1.default.gray("Process exited with code: " + code));
    });
    proc.stdout.on("data", function (data) {
        console.log(data.toString());
    });
    proc.stderr.on("data", function (data) {
        console.log(chalk_1.default.red(data.toString()));
        if (err_halt) {
            console.log(chalk_1.default.red("Error! Forked Child process terminating."));
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
            console.log(chalk_1.default.red(stderr));
            return;
        }
        if (stdout) {
            console.log(stdout);
        }
    });
    proc.on("exit", function (code) {
        console.log(chalk_1.default.gray("Process exited with code: " + code));
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
