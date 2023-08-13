# Developer Notes

## Publish NPM module

Make sure to update the "version" in the package.json file.
Commit and push up all you chances.

```sh
npm login --registry https://registry.npmjs.org
npm publish
```

## Debug logging

Use RegEx search and replace "CTRL+SHIFT+R".

Disable, comment out debug output.

```
^\s*(console.*!debug)
// $1
```

Enable, uncomment debug output.

```
//\s*(console.*!debug)
$1
```
