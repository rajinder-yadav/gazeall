'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopLaunchedProcesses = exports.watchAndRun = void 0;
var path = __importStar(require("path"));
var fs = __importStar(require("fs"));
var node_process_1 = __importDefault(require("node:process"));
var gaze_1 = require("gaze");
var child_process_1 = require("child_process");
var colors_1 = __importDefault(require("colors"));
var PACKAGE_JSON = readPackageJSONProperties();
var child_procs = [];
function getWatchList(cmd) {
    var watch_list = [];
    if (typeof cmd.watch === 'string') {
        watch_list = cmd.watch.split(/\s+/);
    }
    else {
        var arr = cmd.watch.map(function (v) { return v.split(/\s+/); });
        arr.forEach(function (items) {
            watch_list = watch_list.concat(items);
        });
    }
    return watch_list;
}
function watchAndRun(cmd) {
    try {
        if (cmd.npmp || cmd.npms) {
            var watch_list = cmd.files.splice(2);
            cmd.watch = watch_list.length > 0 ? watch_list : '**/*';
        }
        else if (cmd.run) {
            if (!cmd.watch) {
                cmd.watch = ['**/*'];
            }
            else {
                cmd.watch = getWatchList(cmd);
            }
        }
        else if (!cmd.run && (cmd.watch || (cmd.files && cmd.files.length > 0))) {
            cmd.run = ["node ".concat(cmd.files[0])];
            if (!cmd.watch) {
                var watch = cmd.files.splice(1);
                cmd.watch = watch.length > 0 ? watch : ['**/*.js'];
            }
            else {
                cmd.watch = getWatchList(cmd);
            }
        }
        else if (!cmd.run &&
            !cmd.watch &&
            (!cmd.files || cmd.files.length === 0)) {
            cmd.run = ["node ".concat(PACKAGE_JSON['main'])];
            cmd.watch = ['**/*.js'];
        }
        else {
            throw new Error('Missing package.json file, unable to read program name to run using Node.js.');
        }
    }
    catch (err) {
        console.log(colors_1.default.red('Failed to provide a command to execute.'));
        console.log(colors_1.default.red(err.message));
        node_process_1.default.exit(1);
    }
    if (!cmd.wait) {
        run(cmd);
    }
    var gaze = new gaze_1.Gaze(cmd.watch);
    gaze.on('changed', function (file) {
        stopRunningProcess(child_procs);
        child_procs = [];
        run(cmd);
    });
}
exports.watchAndRun = watchAndRun;
function displayErrorMessage(err) {
    if (err instanceof Error) {
        node_process_1.default.stderr.write(colors_1.default.red(err.message));
    }
    else {
        node_process_1.default.stderr.write(colors_1.default.red(err));
    }
    node_process_1.default.stderr.write('\n');
}
function stopRunningProcess(procs, show_message) {
    if (show_message === void 0) { show_message = false; }
    if (procs && procs.length > 0) {
        procs.forEach(function (proc) {
            var err = proc.kill('SIGINT');
            if (show_message) {
                console.log(colors_1.default.red("Stopping process with pid[".concat(proc.pid, "], exit[").concat(proc.exitCode, "] - ").concat(proc.exitCode ? 'failed' : 'success')));
            }
        });
    }
}
function StopLaunchedProcesses() {
    console.log(colors_1.default.red('\nStopping all launched processes.'));
    stopRunningProcess(child_procs, true);
    child_procs = [];
}
exports.StopLaunchedProcesses = StopLaunchedProcesses;
function run(cmd) {
    if (cmd.npmp) {
        var run_list = cmd.npmp.split(/\s+/);
        run_list.forEach(function (script) {
            var command = PACKAGE_JSON['scripts'][script];
            console.log(colors_1.default.blue("=> Executing script: [".concat(command, "] => watching '").concat(cmd.watch, "'")));
            runCommand(command, cmd.halt);
        });
    }
    else if (cmd.npms) {
        var run_list = cmd.npms.split(/\s+/);
        run_list.forEach(function (script) {
            var command = PACKAGE_JSON['scripts'][script];
            console.log(colors_1.default.blue("=> Executing script: [".concat(command, "] => watching '").concat(cmd.watch, "'")));
            var t_execution = runCommandSync(command, cmd.halt);
            console.log(colors_1.default.grey("[".concat(command, "] => Execution completed (").concat(t_execution, " ms).")));
        });
    }
    else if (cmd.run) {
        console.log(colors_1.default.blue("=> Executing: [".concat(cmd.run, "] => watching '").concat(cmd.watch, "'")));
        cmd.run.forEach(function (command) {
            runCommand(command, cmd.halt);
        });
    }
    else {
        console.log(colors_1.default.red('=> Error: Something went wrong, exiting!'));
        node_process_1.default.exit(1);
    }
}
function runCommand(command, err_halt) {
    var args = command.split(/\s+/);
    var cmd = args.shift();
    var proc = (0, child_process_1.spawn)(cmd, args, { detached: true });
    child_procs.push(proc);
    var t_start = performance.now();
    proc.stdout.on('data', function (data) {
        node_process_1.default.stdout.write("[".concat(command, "] => ").concat(data.toString()));
    });
    proc.stderr.on('data', function (data) {
        displayErrorMessage(data.toString());
        if (err_halt) {
            stopRunningProcess(child_procs);
            node_process_1.default.stderr.write(colors_1.default.red("[".concat(command, "] => Error: Execution terminating.\n")));
            node_process_1.default.exit(1);
        }
    });
    proc.on('close', function (code) {
        var t_end = performance.now();
        console.log(colors_1.default.grey("[".concat(command, "] => Execution completed (").concat(t_end - t_start, " ms).")));
    });
}
function runCommandSync(command, err_halt) {
    var t_start = performance.now();
    var t_end = t_start;
    try {
        var out = (0, child_process_1.execSync)(command);
        t_end = performance.now();
        if (out) {
            node_process_1.default.stdout.write("[".concat(command, "] => ").concat(out.toString()));
        }
    }
    catch (err) {
        displayErrorMessage(err);
        if (err_halt) {
            stopRunningProcess(child_procs);
            node_process_1.default.exit(1);
        }
    }
    return t_end - t_start;
}
function readPackageJSONProperties() {
    var file = path.join(node_process_1.default.cwd(), 'package.json');
    var stats = fs.statSync(file);
    if (stats.isFile()) {
        var data = fs.readFileSync(file, 'utf8');
        var package_json = JSON.parse(data);
        if (!package_json['main'] || package_json['main'] === '') {
            throw new Error('Field main is missing or empty in package.json');
        }
        stats = fs.statSync(package_json['main']);
        if (!stats.isFile()) {
            throw new Error("File ".concat(package_json['main'], " declared in package.json not found."));
        }
        return package_json;
    }
    return {};
}
