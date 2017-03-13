#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cmd = require("commander");
var utils_1 = require("./lib/utils");
/**
 * Command options.
 */
cmd
    .version("0.2.0")
    .usage("[options] <file ...>")
    .option("--run <commands>", "run commands then wait for changes to re-run.")
    .option("--wait-run <commands>", "wait first, commands to run on changes.")
    .option("--runp-npm <scripts>", "npm scripts to run parallel.")
    .option("--runs-npm <scripts>", "npm scripts to run synchronous.")
    .option("--delay <ms>", "start delay value in milliseconds.")
    .option("--halt-on-error", "halt on error.")
    .parse(process.argv);
/**
 * Start watching after delay interval or next event loop if value not provided.
 */
setTimeout(function () {
    utils_1.watchAndRun(cmd);
}, parseInt(cmd.delay) || 0);
