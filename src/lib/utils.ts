'use strict';

import * as path from 'path';
import * as fs from 'fs';
import process from 'node:process';

import {Gaze} from 'gaze';
import {exec, execSync, ChildProcess, spawn} from 'child_process';
import colors from 'colors';
// import { config } from "shelljs";

/**
 * Command types
 */
export interface GazeallOptions {
  process_name: string;
  delay?: number;
  halt?: boolean;
  npmp?: string;
  npms?: string;
  run?: string[];
  wait?: boolean;
  watch?: string | string[];
  files?: string[];
}

const PACKAGE_JSON = readPackageJSONProperties();

/**
 * Current running Child process.
 */
let child_procs: ChildProcess[] = [];

/**
 * Run command on file or folder change.
 * @param {GazeallOptions} cmd - The program arguments from commander module.
 * @return {void}
 */
export function watchAndRun(cmd: any): void {
  // console.log( "debug [watchAndRun]> ", cmd );
  const isNotNpmScript = cmd.npmp === undefined && cmd.npms === undefined;

  try {
    if (cmd.run) {
      // Called as: gazeall --run "node main.js" OR
      // Called as: gazeall --run "node main.js --watch <watch...>"
      if (!cmd.watch) {
        // Default to watch all file in current and all sub-folders.
        cmd.watch = ['**/*'];
      } else {
        // Split and flatten as required.
        // Could be: "file1 file2 ..."
        //       or: ["file1 file2 ...", "file3"]
        //       or: ["file1", "file2", ...]
        let watch_list = [];
        if (typeof cmd.watch === 'string') {
          watch_list = cmd.watch.split(/\s+/);
        } else {
          let arr = cmd.watch.map((v: string) => v.split(/\s+/));
          arr.forEach((items: string) => {
            watch_list = watch_list.concat(items);
          });
        }
        cmd.watch = watch_list;
      }
      console.log('debug [watchAndRun:run] 1> ', cmd.run);
      console.log('debug [watchAndRun:watch] 1> ', cmd.watch);
      console.log('debug [watchAndRun:cmd] 1> ', cmd);
      // Called with command and no watch files.
    } else if (
      isNotNpmScript &&
      !cmd.run &&
      cmd.files &&
      cmd.files.length > 0
    ) {
      // Called as: gazeall main.js
      //        or: gazeall main.js <watch...> OR
      console.log('debug [watchAndRun:cmd] 2> ', cmd);
      console.log('debug [watchAndRun:files] 2> ', cmd.files);
      // Called with no run command, only a node.js run file.
      // This is the shorthand to run the watch file using Node.js.
      // Default to watch all files in current and all sub-folders.
      cmd.run = [`node ${cmd.files[0]}`];

      let watch = cmd.files;
      cmd.watch = watch.length > 0 ? watch : ['**/*'];
      console.log('debug [watchAndRun:run] 2> ', cmd.run);
      console.log('debug [watchAndRun:watch] 2> ', cmd.watch);
    } else if (!cmd.run && (!cmd.files || cmd.files.length === 0)) {
      console.log('debug [watchAndRun:cmd] 3> ', cmd);

      // Called as: gazeall
      //        or: gazeall --npms "start"
      //        or: gazeall --npmp "start"
      // Called with no watch files.
      // Try to read filename from package.json
      // The field "main" will be used as the file to execute using Node.js.
      cmd.run = [`node ${PACKAGE_JSON['main']}`];
      cmd.watch = ['**/*'];
      console.log('debug [watchAndRun:run] 3> ', cmd.run);
      console.log('debug [watchAndRun:watch] 3> ', cmd.watch);
    } else {
      throw new Error(
        'Missing package.json file, unable to read program name to run using Node.js.'
      );
    }
  } catch (err) {
    console.log(colors.red('Failed to provide a command to execute.'));
    console.log(colors.red(err.message));
    process.exit(1);
  }

  // Check if we run first or wait first.
  if (!cmd.wait) {
    run(cmd);
  }

  const gaze = new Gaze(cmd.watch);

  // Uncomment for debugging
  // gaze.on( "ready", watcher => {
  //   const watched = gaze.watched();
  //   console.log( colors.magenta( watched ) );
  // } );

  gaze.on('changed', (file: string) => {
    stopRunningProcess(child_procs);
    child_procs = [];
    run(cmd);
  });
}

/**
 * Output error message to terminal.
 * @param err {Error|string} - Error message to be shown.
 * @return {void}
 */
function displayErrorMessage(err: Error | string) {
  if (err instanceof Error) {
    process.stderr.write(colors.red(err.message));
  } else {
    process.stderr.write(colors.red(err));
  }
  process.stderr.write('\n');
}

/**
 * Stop running processes.
 * @param procs {ChildProcess} - List of running processes.
 * @return {void}
 */
function stopRunningProcess(
  procs: ChildProcess[],
  show_message: boolean = false
) {
  if (procs && procs.length > 0) {
    procs.forEach((proc: ChildProcess) => {
      const err = proc.kill('SIGINT');
      if (show_message) {
        console.log(
          colors.red(
            `Stopping process with pid[${proc.pid}], exit[${proc.exitCode}] - ${
              proc.exitCode ? 'failed' : 'success'
            }`
          )
        );
      }
    });
  }
}

/**
 * Stop all running launched processes.
 */
export function StopLaunchedProcesses() {
  console.log(colors.red('\nStopping all launched processes.'));
  stopRunningProcess(child_procs, true);
  child_procs = [];
}

/**
 * Execute Child process based on switch used.
 * @param {GazeallOptions} cmd - Commander program arguments.
 * @return {void}
 */
function run(cmd: GazeallOptions): void {
  // Only one of the following should run.
  if (cmd.npmp) {
    // Run NPM scripts in parallel.
    const run_list: string[] = cmd.npmp.split(/\s+/);
    // console.log( "debug [npmp]>", run_list );
    run_list.forEach((command: string) => {
      console.log(
        colors.blue(`=> Executing script: ${command}, watching ${cmd.watch}`)
      );
      spawnNpmCommand(command, cmd.halt);
      // runNPMCommand( command, cmd.halt );
    });
  } else if (cmd.npms) {
    // Run NPM scripts in sequence.
    const run_list: string[] = cmd.npms.split(/\s+/);
    run_list.forEach((command: string) => {
      console.log(
        colors.blue(`=> Executing script: ${command}, watching ${cmd.watch}`)
      );
      runNPMSyncCommand(`npm run ${command}`, cmd.halt);
    });
  } else if (cmd.run) {
    // Run User supplied command.
    console.log(colors.blue(`=> Executing: ${cmd.run}, watching ${cmd.watch}`));
    cmd.run.forEach((command) => {
      runCommand(command, cmd.halt);
    });
  } else {
    // Should never get here.
    console.log(colors.red('=> Error: Something went wrong, exiting!'));
    process.exit(1);
  }
}

/**
 * Child process run in detached mode in their own terminal.
 * @param {string} command - Command executed in a detached Child process.
 * @param {err_halt} boolean - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {void}
 */
function runCommand(command: string, err_halt: boolean): void {
  const args: string[] = command.split(/\s+/);
  const cmd: string = args.shift();
  const proc: ChildProcess = spawn(cmd, args, {detached: true});
  child_procs.push(proc);

  proc.stdout.on('data', (data: Buffer) => {
    process.stdout.write(`[${command}] => ${data.toString()}`);
  });

  proc.stderr.on('data', (data: Buffer) => {
    displayErrorMessage(data.toString());
    if (err_halt) {
      stopRunningProcess(child_procs);
      process.stderr.write(
        colors.red(`[${command}] => Error: Execution terminating.\n`)
      );
      process.exit(1);
    }
  });

  proc.on('close', (code) => {
    console.log(colors.grey(`[${command}] => Execution completed.`));
  });
}

function spawnNpmCommand(command: string, err_halt: boolean): void {
  // console.log( "debug [spawnNpmCommand]> ", package_json[ "scripts" ][ command ] );
  runCommand(PACKAGE_JSON['scripts'][command], err_halt);
}

/**
 * Run NPM scripts asynchronously for switch --runp-npm
 * @param {string} command - Command to execute.
 * @param {boolean} err_halt - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {void}
 */
function runNPMCommand(command: string, err_halt: boolean): void {
  // console.log( "debug [runNPMCommand] > ", command );
  const proc: ChildProcess = exec(
    `npm run ${command}`,
    (err, stdout, stderr) => {
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
        process.stdout.write(`${stdout}`);
      }
    }
  ); // exec
  child_procs.push(proc);
}

/**
 * Run NPM scripts synchronously for switch --runs-npm
 * @param {string} command - Command to execute.
 * @param {boolean} err_halt - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {void}
 */
function runNPMSyncCommand(command: string, err_halt: boolean): void {
  try {
    const out: Buffer | String = execSync(command);
    if (out) {
      process.stdout.write(out.toString());
    }
  } catch (err) {
    displayErrorMessage(err);
    if (err_halt) {
      stopRunningProcess(child_procs);
      process.exit(1);
    }
  }
}

/**
 * Read package.json file and return settings as object.
 *
 * @returns package.json object
 */
function readPackageJSONProperties() {
  const file = path.join(process.cwd(), 'package.json');
  let stats = fs.statSync(file);

  if (stats.isFile()) {
    const data = fs.readFileSync(file, 'utf8');
    const package_json = JSON.parse(data);

    if (!package_json['main'] || package_json['main'] === '') {
      throw new Error('Field main is missing or empty in package.json');
    }

    stats = fs.statSync(package_json['main']);

    if (!stats.isFile()) {
      throw new Error(
        `File ${package_json['main']} declared in package.json not found.`
      );
    }
    return package_json;
  }
  return {};
}
