#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cmd = require("commander");
var utils_1 = require("./lib/utils");
cmd
    .version("0.2.1")
    .usage("[options] <file ...>")
    .option("--run <commands>", "run commands then wait for changes to re-run.")
    .option("--wait-run <commands>", "wait first, commands to run on changes.")
    .option("--runp-npm <scripts>", "npm scripts to run parallel.")
    .option("--runs-npm <scripts>", "npm scripts to run synchronous.")
    .option("--delay <ms>", "start delay value in milliseconds.")
    .option("--halt-on-error", "halt on error.")
    .parse(process.argv);
setTimeout(function () {
    utils_1.watchAndRun(cmd);
}, parseInt(cmd.delay) || 0);
