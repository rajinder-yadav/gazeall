{
  "name": "gazeall",
  "version": "0.10.1",
  "description": "Gazeall - The all seeing file watcher and command executor.",
  "main": "src/main.ts",
  "config": {
    "doc_folder": "docs/typedoc"
  },
  "bin": {
    "gazeall": "bin/main.js"
  },
  "scripts": {
    "build": "cross-env NODE_ENV=prod tsc",
    "check": "eslint ./src --ext .ts",
    "clean": "shx rm -rf bin",
    "doc": "typedoc --module commonjs --target ES5 --ignoreCompilerErrors --exclude node_modules --out $npm_package_config_doc_folder src",
    "format": "prettier --write \"src/**/*.ts\"",
    "node:debug": "node --inspect --debug-brk $npm_package_bin_gazeall",
    "prebuild": "run-s format clean",
    "precommit": "run-s format",
    "predoc": "shx rm -rf $npm_package_config_doc_folder && shx mkdir -p $npm_package_config_doc_folder",
    "prepush": "run-s test",
    "pretest": "run-s build",
    "test": "tape \"bin/**/*/test.*.js\"|tap-summary",
    "tsc": "tsc"
  },
  "keywords": [
    "javascript",
    "js",
    "npm",
    "ts",
    "typescript",
    "watcher"
  ],
  "author": "Rajinider Yadav <devguy.ca@gmail.com> (https://github.com/rajinder-yadav)",
  "license": "GPL-3.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/rajinder-yadav/gazeall"
  },
  "devDependencies": {
  },
  "dependencies": {
  }
}
