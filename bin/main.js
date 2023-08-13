#!/usr/bin/env node
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_process_1 = __importDefault(require("node:process"));
var commander_1 = require("commander");
var utils_1 = require("./lib/utils");
node_process_1.default.on('SIGINT', function (code) {
    (0, utils_1.StopLaunchedProcesses)();
    node_process_1.default.exit(0);
});
var cmd = new commander_1.Command();
cmd
    .version('0.10.0', '-v, --version')
    .usage('[options] [files...]')
    .option('-r, --run <command...>', 'run commands then wait for changes to re-run.')
    .option('-w, --watch <files...>', 'files to watch for change.')
    .option('-W, --wait', 'enter wait, commands will run on changes.')
    .option('-p, --npmp <scripts>', 'NPM scripts to run parallel.')
    .option('-s, --npms <scripts>', 'NPM scripts to run synchronous.')
    .option('-d, --delay <ms>', 'start delay value in milliseconds.')
    .option('-H, --halt', 'halt on error.')
    .parse(node_process_1.default.argv);
var options = cmd.opts();
options.args = cmd.args;
console.log('debug [options]> ', options);
console.log('debug [cmd.args]> ', cmd.args);
setTimeout(function () {
    (0, utils_1.watchAndRun)(options);
}, parseInt(options['delay']) || 0);
