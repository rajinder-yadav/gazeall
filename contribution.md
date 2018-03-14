
## Contribution - TypeScript development

### Source code

Place all TypeScript code under the folder, `src/`, they will be picked up from here and compiled to the, `bin/` folder under the project root.

You are free to create addition folder and sub-folder under, `src/`, the compiler will recursively find and compile all TypeScript code.

All TypeScript code in compiled to _ES5_ JavaScript. The target JavaScript code can be changed from the [TypeScript configuration](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html) file, `tsconfig.json`.

Some of the things to be controlled are:

* Files to compile
* Folders to include
* Folders to exclude
* Target compiled output
* Source map (Needed for debugging)
* Module system (Use commonjs for Node)
* Output file

Supported compiled targets include: `ES3, ES5, ES6, ES2016, ES2017`

See [compiler options](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for more details.

### Building and Publishing

To compile the TypeScript code, use the following command to start the build process:

```sh
npm run build
npm publish
```

**Warning** - The `bin/` folder and all sub-folders within it will be deleted to insure a clean build is performed each time. Do not place any files you will need later!

### Testing the build

To quickly test _gazeall_, type:

```sh
mkdir -p /tmp/watch/log
cd /tmp/watch
touch index.html main.ts log/run.log
npm i gazeall

gvim

npx gazeall --run "ls -l" "/tmp/watch/**/*"
```

From the editor make changes to each of the three files and make sure you see the `ls -l` command execute each time.

### Library code (Modules)

Place any module or library source code that you write under the, `src/lib/`, sub-folder. The compiled source code will be output to the, `bin/lib/`, folder.

This project was creating using [TSCLI](https://github.com/rajinder-yadav/tscli).

### Benefits of using TSCLI

Here are the benefits you will enjoy right out of the gate:

* Quick start
* Best Practices
* Build system
* Code in TypeScript
* Code TypeScript Modules
* HTML live edit and preview
* Error logging
* Code Linting
* Code Formatting
* Document Generation
* Git commit hooks
* Continuous integration (under research)

## Coding guideline

This is the _coding guideline_ followed on the Gazeall project, you may find it helpful with your projects.

Read the [coding guideline](https://github.com/rajinder-yadav/tscli/wiki/Coding-guideline) found in the wiki.
