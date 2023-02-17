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
 * Parse watch list.
 * @param {GazeallOptions} cmd - The program arguments from commander module.
 * @returns {string[]} - Lsit of file or folder names.
 */
function getWatchList(cmd: any): string[] {
  // Split and flatten as required.
  // Could be: "file1 file2 ..."
  //       or: ["file1 file2 ...", "file3"]
  //       or: ["file1", "file2", ...]

  let watch_list: string[] = [];
  if (typeof cmd.watch === 'string') {
    watch_list = cmd.watch.split(/\s+/);
  } else {
    let arr = cmd.watch.map((v: string) => v.split(/\s+/));
    arr.forEach((items: string) => {
      watch_list = watch_list.concat(items);
    });
  }
  return watch_list;
}

/**
 * Run command on file or folder change.
 * @param {GazeallOptions} cmd - The program arguments from commander module.
 * @return {void}
 */
export function watchAndRun(cmd: any): void {
  //  console.log('debug [watchAndRun]> ', cmd); // !debug

  if (cmd.npmp || cmd.npms) {
    const watch_list = cmd.files.splice(2);
    cmd.watch = watch_list.length > 0 ? watch_list : '**/*';
    //    console.log('debug [watchAndRun:npmp] 0> ', cmd.npmp); // !debug
    //    console.log('debug [watchAndRun:npms] 0> ', cmd.npms); // !debug
    //    console.log('debug [watchAndRun:watch] 0> ', cmd.watch); // !debug
  } else if (cmd.run) {
    // Called as: gazeall --run "node main.js" OR
    // Called as: gazeall --run "node main.js --watch <watch...>"
    if (!cmd.watch) {
      // Default to watch all file in current and all sub-folders.
      cmd.watch = ['**/*'];
    } else {
      cmd.watch = getWatchList(cmd);
    }
    //    console.log('debug [watchAndRun:run] 1> ', cmd.run); // !debug
    //    console.log('debug [watchAndRun:watch] 1> ', cmd.watch); // !debug
    //    console.log('debug [watchAndRun:cmd] 1> ', cmd); // !debug
    // Called with command and no watch files.
  } else if (!cmd.run && (cmd.watch || (cmd.files && cmd.files.length > 0))) {
    // Called as: gazeall main.js
    //        or: gazeall main.js <watch...> OR
    //    console.log('debug [watchAndRun:cmd] 2> ', cmd); // !debug
    //    console.log('debug [watchAndRun:files] 2> ', cmd.files); // !debug
    // Called with no run command, only a node.js run file.
    // This is the shorthand to run the watch file using Node.js.
    // Default to watch all files in current and all sub-folders.
    cmd.run = [`node ${cmd.files[0]}`];

    if (!cmd.watch) {
      // Default to watch all file in current and all sub-folders.
      let watch = cmd.files.splice(1);
      cmd.watch = watch.length > 0 ? watch : ['**/*.js'];
    } else {
      cmd.watch = getWatchList(cmd);
    }
    //    console.log('debug [watchAndRun:run] 2> ', cmd.run); // !debug
    //    console.log('debug [watchAndRun:watch] 2> ', cmd.watch); // !debug
  } else if (!cmd.run && !cmd.watch && (!cmd.files || cmd.files.length === 0)) {
    //    console.log('debug [watchAndRun:cmd] 3> ', cmd); // !debug

    // Called as: gazeall
    // Called with no run and watch files.
    // Try to read run filename from package.json
    // The field "main" will be used as the file to execute using Node.js.
    cmd.run = [`node ${PACKAGE_JSON['main']}`];
    cmd.watch = ['**/*.js'];
    //    console.log('debug [watchAndRun:run] 3> ', cmd.run); // !debug
    //    console.log('debug [watchAndRun:watch] 3> ', cmd.watch); // !debug
  } else {
    console.log(
      colors.red(
        'Missing package.json file, unable to read program name to run using Node.js.'
      )
    );
    console.log(colors.red('Failed to provide a command to execute.'));
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
    //    console.log('debug [npmp]>', run_list); // !debug
    run_list.forEach((script: string) => {
      const command = PACKAGE_JSON['scripts'][script];
      console.log(
        colors.blue(
          `=> Executing script: [${command}] => watching '${cmd.watch}'`
        )
      );
      runCommand(command, cmd?.halt || false);
    });
  } else if (cmd.npms) {
    // Run NPM scripts in sequence.
    const run_list: string[] = cmd.npms.split(/\s+/);
    //    console.log('debug [npms]>', run_list); // !debug
    run_list.forEach((script: string) => {
      const command = PACKAGE_JSON['scripts'][script];
      console.log(
        colors.blue(
          `=> Executing script: [${command}] => watching '${cmd.watch}'`
        )
      );
      const t_execution = runCommandSync(command, cmd?.halt || false);
      console.log(
        colors.grey(`[${command}] => Execution completed (${t_execution} ms).`)
      );
    });
  } else if (cmd.run) {
    // Run User supplied command.
    console.log(
      colors.blue(`=> Executing: [${cmd.run}] => watching '${cmd.watch}'`)
    );
    cmd.run.forEach((command) => {
      runCommand(command, cmd?.halt || false);
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
  const cmd: string = args.shift() || '';
  const proc: ChildProcess = spawn(cmd, args, {detached: true});
  child_procs.push(proc);

  const t_start = performance.now();
  //  console.log('debug t0=', t_start); // !debug

  if (proc.stdout) {
    proc.stdout.on('data', (data: Buffer) => {
      process.stdout.write(`[${command}] => ${data.toString()}`);
    });
  }

  if (proc.stderr) {
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
  }

  proc.on('close', (code) => {
    const t_end = performance.now();
    //    console.log('debug t0==', t_start); // !debug
    console.log(
      colors.grey(
        `[${command}] => Execution completed (${t_end - t_start} ms).`
      )
    );
  });
}

/**
 * Run NPM scripts asynchronously for switch --runp-npm
 * @param {string} command - Command to execute.
 * @param {boolean} err_halt - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {void}
 */
// function runNPMCommand(command: string, err_halt: boolean): void {
////    console.log( "debug [runNPMCommand] > ", command );  // !debug
//   const proc: ChildProcess = exec(
//     `npm run ${command}`,
//     (err, stdout, stderr) => {
//       if (err && err_halt) {
//         displayErrorMessage(stderr);
//         stopRunningProcess(child_procs);
//         process.exit(1);
//       }
//       if (stderr) {
//         displayErrorMessage(stderr);
//         if (err_halt) {
//           stopRunningProcess(child_procs);
//           process.exit(1);
//         }
//         return;
//       }
//       if (stdout) {
//         process.stdout.write(`[${command}] => ${stdout}`);
//       }
//     }
//   ); // exec
//   child_procs.push(proc);
// }

/**
 * Run NPM scripts synchronously for switch --runs-npm
 * @param {string} command - Command to execute.
 * @param {boolean} err_halt - Determines gazeall respose on an error,
 *                              If false, then ignore the error,
 *                              If true, then exit gazeall.
 * @return {number} - Execution time in millisonds.
 */
function runCommandSync(command: string, err_halt: boolean): number {
  const t_start: number = performance.now();
  let t_end: number = t_start;
  try {
    const out: Buffer | String = execSync(command);
    t_end = performance.now();
    if (out) {
      process.stdout.write(`[${command}] => ${out.toString()}`);
    }
  } catch (err: any) {
    displayErrorMessage(err);
    if (err_halt) {
      stopRunningProcess(child_procs);
      process.exit(1);
    }
  }
  return t_end - t_start;
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
