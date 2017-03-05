#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cmd = require("commander");
var utils_1 = require("./lib/utils");
/**
 * Command options.
 */
cmd
    .version("0.1.0")
    .usage("[options] <file ...>")
    .option("--run <command>", "command to run.")
    .option("--delay <ms>", "delay value in milliseconds.")
    .option("--halt-on-error", "halt on error.")
    .parse(process.argv);
/**
 * Start watching after delay interval or next event loop if value not provided.
 */
setTimeout(function () {
    utils_1.watchAndRun(cmd);
}, cmd.delay || 0);
