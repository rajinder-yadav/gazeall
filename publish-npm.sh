#!/usr/bin/env bash
npm login --registry https://registry.npmjs.org
npm publish

if [ $? -eq 0 ]; then
  echo "Gazeall has been published to NPM successfully"
  echo "https://www.npmjs.com/package/gazeall"
else
  echo "!!! ERROR: Something went wrong"
fi
