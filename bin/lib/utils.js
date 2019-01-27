"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var fs = require("fs");
var gaze_1 = require("gaze");
var child_process_1 = require("child_process");
var chalk_1 = require("chalk");
var child_procs = [];
function watchAndRun(cmd) {
    try {
        if (cmd.run && (!cmd.args || cmd.args.length === 0)) {
            cmd.args = "**/*";
        }
        else if (!cmd.run && cmd.args && cmd.args.length > 0) {
            cmd.run = "node " + cmd.args;
            cmd.args = "**/*.js";
        }
        else if (!cmd.run && (!cmd.args || cmd.args.length === 0)) {
            cmd.args = "**/*.js";
            var file = path.join(process.cwd(), "package.json");
            var stats = fs.statSync(file);
            if (stats.isFile()) {
                var data = fs.readFileSync(file, "utf8");
                var package_json = JSON.parse(data);
                if (!package_json.main || package_json.main === "") {
                    throw new Error("Field main is missing or empty in package.json");
                }
                stats = fs.statSync(package_json.main);
                if (!stats.isFile()) {
                    throw new Error("File " + package_json.main + " declared in package.json not found.");
                }
                cmd.run = "node " + package_json.main;
            }
            else {
                throw new Error("Missing package.json file, unable to read program name to run using Node.js.");
            }
        }
    }
    catch (err) {
        console.log(chalk_1.default.red("Failed to provide a command to execute."));
        console.log(chalk_1.default.red(err.message));
        process.exit(1);
    }
    if (!cmd.waitFirst) {
        run(cmd);
    }
    var gaze = new gaze_1.Gaze(cmd.args);
    gaze.on("changed", function (file) {
        stopRunningProcess(child_procs);
        child_procs = [];
        run(cmd);
    });
}
exports.watchAndRun = watchAndRun;
function displayErrorMessage(err) {
    if (err instanceof Error) {
        process.stderr.write(chalk_1.default.red(err.message));
    }
    else {
        process.stderr.write(chalk_1.default.red(err));
    }
    process.stderr.write("\n");
}
function stopRunningProcess(procs) {
    if (procs && procs.length > 0) {
        procs.forEach(function (proc) {
            proc.kill();
        });
    }
}
function StopLaunchedProcesses() {
    console.log(chalk_1.default.red("\nStopping all launched processes."));
    stopRunningProcess(child_procs);
    child_procs = [];
}
exports.StopLaunchedProcesses = StopLaunchedProcesses;
function run(cmd) {
    if (cmd.run) {
        console.log(chalk_1.default.blue("=> Executing: " + cmd.run + ", watching " + cmd.args));
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
        console.log(chalk_1.default.red("=> Error: Something went wrong, exiting!"));
        process.exit(1);
    }
}
function runCommand(command, err_halt) {
    var args = command.split(/\s+/);
    var cmd = args.shift();
    var proc = child_process_1.spawn(cmd, args, { detached: true });
    child_procs.push(proc);
    proc.stdout.on("data", function (data) {
        process.stdout.write(data.toString());
    });
    proc.stderr.on("data", function (data) {
        displayErrorMessage(data.toString());
        if (err_halt) {
            stopRunningProcess(child_procs);
            process.stderr.write(chalk_1.default.red("=> Error: Execution terminating.\n"));
            process.exit(1);
        }
    });
    proc.on("close", function (code) {
        console.log(chalk_1.default.grey("=> Execution completed."));
    });
}
function runNPMCommand(command, err_halt) {
    var proc = child_process_1.exec(command, function (err, stdout, stderr) {
        if (err && err_halt) {
            displayErrorMessage(stderr);
            stopRunningProcess(child_procs);
            process.exit(1);
        }
        if (stderr) {
            displayErrorMessage(stderr);
            if (err_halt) {
                stopRunningProcess(child_procs);
                process.exit(1);
            }
            return;
        }
        if (stdout) {
            process.stdout.write(stdout);
        }
    });
    child_procs.push(proc);
}
function runNPMSyncCommand(command, err_halt) {
    try {
        var out = child_process_1.execSync(command);
        if (out) {
            process.stdout.write(out.toString());
        }
    }
    catch (err) {
        displayErrorMessage(err);
        if (err_halt) {
            stopRunningProcess(child_procs);
            process.exit(1);
        }
    }
}
