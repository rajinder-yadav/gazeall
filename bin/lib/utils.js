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
    var _a;
    if (cmd.npmp || cmd.npms) {
        if (!cmd.watch) {
            cmd.watch = ((_a = cmd.args) === null || _a === void 0 ? void 0 : _a.length) > 0 ? cmd.args : '**/*';
        }
    }
    else if (cmd.run) {
        if (!cmd.watch) {
            cmd.watch = ['**/*'];
        }
        else {
            cmd.watch = getWatchList(cmd);
        }
    }
    else if (!cmd.run && (cmd.watch || (cmd.args && cmd.args.length > 0))) {
        cmd.run = ["node ".concat(cmd.args[0])];
        if (!cmd.watch) {
            var watch = cmd.args.splice(1);
            cmd.watch = watch.length > 0 ? watch : ['**/*'];
        }
        else {
            cmd.watch = getWatchList(cmd);
        }
    }
    else if (!cmd.run && !cmd.watch && (!cmd.args || cmd.args.length === 0)) {
        var package_json_main = PACKAGE_JSON['main'];
        if (!package_json_main) {
            console.log(colors_1.default.red('=> Error: No run file passed and field "main" is missing in package.json, please correct one.'));
            node_process_1.default.exit(1);
        }
        cmd.run = ["node ".concat(package_json_main)];
        cmd.watch = ['**/*.js'];
        try {
            fs.statSync(package_json_main);
        }
        catch (ex) {
            console.log(colors_1.default.red("=> Error: File ".concat(package_json_main, " declared in package.json not found.")));
            node_process_1.default.exit(8);
        }
    }
    else {
        console.log(colors_1.default.red('=> Error: Missing package.json file, unable to read program name to run using Node.js.'));
        console.log(colors_1.default.red('=> Error: Failed to provide a command to execute.'));
        node_process_1.default.exit(2);
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
            proc.kill('SIGINT');
            if (show_message) {
                console.log(colors_1.default.red("=> Stopping process with pid[".concat(proc.pid, "], exit[").concat(proc.exitCode, "] - ").concat(proc.exitCode === 0 ? 'success' : 'failed')));
            }
        });
    }
}
function StopLaunchedProcesses() {
    console.log(colors_1.default.red("\n=> Stopping ".concat(child_procs.length, " launched processes.")));
    stopRunningProcess(child_procs, true);
    child_procs = [];
}
exports.StopLaunchedProcesses = StopLaunchedProcesses;
function run(cmd) {
    if (cmd.npmp) {
        var run_list = cmd.npmp.split(/\s+/);
        console.log('debug [npmp]>', run_list);
        run_list.forEach(function (script) {
            var command = PACKAGE_JSON['scripts'][script];
            var pid = runCommand(command, (cmd === null || cmd === void 0 ? void 0 : cmd.halt) || false);
            console.log(colors_1.default.blue("=> Running script [".concat(pid, ":").concat(command, "] + Watching '").concat(cmd.watch, "'")));
        });
    }
    else if (cmd.npms) {
        var run_list = cmd.npms.split(/\s+/);
        console.log('debug [npms]>', run_list);
        run_list.forEach(function (script) {
            var command = PACKAGE_JSON['scripts'][script];
            console.log(colors_1.default.blue("=> Running script [".concat(command, "] + Watching '").concat(cmd.watch, "'")));
            var t_execution = runCommandSync(command, (cmd === null || cmd === void 0 ? void 0 : cmd.halt) || false);
            console.log(colors_1.default.grey("=> Process [".concat(command, "] completed (").concat(t_execution, " ms).")));
        });
    }
    else if (cmd.run) {
        cmd.run.forEach(function (command) {
            var pid = runCommand(command, (cmd === null || cmd === void 0 ? void 0 : cmd.halt) || false);
            console.log(colors_1.default.blue("=> Running [".concat(pid, ":").concat(command, "] + Watching '").concat(cmd.watch, "'")));
        });
    }
    else {
        console.log(colors_1.default.red('=> Error: Something went wrong, exiting!'));
        node_process_1.default.exit(3);
    }
}
function runCommand(command, err_halt) {
    var args = command.split(/\s+/);
    var cmd = args.shift() || '';
    var proc = (0, child_process_1.spawn)(cmd, args, { detached: true });
    var t_start = performance.now();
    child_procs.push(proc);
    if (proc.stdout) {
        proc.stdout.on('data', function (data) {
            data
                .toString()
                .split('\n')
                .filter(function (v) { return v !== ''; })
                .map(function (v) {
                return node_process_1.default.stdout.write("[".concat(proc === null || proc === void 0 ? void 0 : proc.pid, ":").concat(command, "] => ").concat(v, "\n"));
            });
        });
    }
    if (proc.stderr) {
        proc.stderr.on('data', function (data) {
            displayErrorMessage(data.toString());
            if (err_halt) {
                stopRunningProcess(child_procs);
                node_process_1.default.stderr.write(colors_1.default.red("=> Error! Process [".concat(proc === null || proc === void 0 ? void 0 : proc.pid, ":").concat(command, "] terminating.\n")));
                node_process_1.default.exit(4);
            }
        });
    }
    proc.on('close', function (code) {
        var t_end = performance.now();
        console.log(colors_1.default.grey("=> Process [".concat(proc === null || proc === void 0 ? void 0 : proc.pid, ":").concat(command, "] completed (").concat(t_end - t_start, " ms).")));
    });
    return proc === null || proc === void 0 ? void 0 : proc.pid;
}
function runCommandSync(command, err_halt) {
    var t_start = performance.now();
    var t_end = t_start;
    try {
        var out = (0, child_process_1.execSync)(command);
        t_end = performance.now();
        if (out) {
            out
                .toString()
                .split('\n')
                .filter(function (v) { return v !== ''; })
                .map(function (v) { return node_process_1.default.stdout.write("[".concat(command, "] => ").concat(v, "\n")); });
        }
    }
    catch (err) {
        displayErrorMessage(err);
        if (err_halt) {
            stopRunningProcess(child_procs);
            node_process_1.default.exit(5);
        }
    }
    return t_end - t_start;
}
function readPackageJSONProperties() {
    try {
        var file = path.join(node_process_1.default.cwd(), 'package.json');
        var stats = fs.statSync(file);
        if (stats.isFile()) {
            var data = fs.readFileSync(file, 'utf8');
            var package_json = JSON.parse(data);
            if (!package_json['main'] || package_json['main'] === '') {
                console.log(colors_1.default.red('=> Warning! Field main is missing or empty in package.json'));
            }
            try {
                stats = fs.statSync(package_json['main']);
            }
            catch (ex) {
                console.log(colors_1.default.red("=> Warning! File ".concat(package_json['main'], " declared in package.json not found.")));
            }
            return package_json;
        }
    }
    catch (ex) {
        console.log(colors_1.default.red("=> Error: File package.json not found."));
        node_process_1.default.exit(6);
    }
    return undefined;
}
