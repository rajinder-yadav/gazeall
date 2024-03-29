module.exports =  {
  parser:  '@typescript-eslint/parser',  // Specifies the ESLint parser
  plugins: ['@typescript-eslint', 'prettier'],
  extends:  [
    'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
 parserOptions:  {
    ecmaVersion:  2018,  // Allows for the parsing of modern ECMAScript features
    sourceType:  'module',  // Allows for the use of imports
  },
  "rules": {
    "adjacent-overload-signatures": true,
    "no-magic-numbers": true,
    "prefer-for-of": true,
    "curly": true,
    "no-arg": true,
    "no-bitwise": true,
    "no-conditional-assignment": true,
    "no-debugger": true,
    "no-empty": true,
    "no-invalid-this": true,
    "no-null-keyword": true,
    "no-shadowed-variable": true,
    "no-var-keyword": true,
    "switch-default": true,
    "eofline": true,
    "linebreak-style": [true, "LF"],
    "no-require-imports": true,
    "prefer-const": true,
    "interface-name": [true, "never-prefix"],
    "trailing-comma": [
      true, {"multiline": "always",
        "singleline": "never"}
    ],
    "jsdoc-format": true,
    "one-variable-per-declaration": [
      true,
      "ignore-for-loop"
    ],
    "no-duplicate-variable": true,
    "triple-equals": [
      true,
      "allow-null-check"
    ],
    "class-name": true,
    "no-unnecessary-initializer": true,
    "comment-format": [
      true,
      "check-space"
    ],
    "indent": [
      true,
      "spaces"
    ],
    "no-eval": true,
    "no-internal-module": true,
    "no-trailing-whitespace": true,
    "no-unsafe-finally": true,
    "one-line": [
      true,
      "check-open-brace",
      "check-whitespace"
    ],
    "quotemark": [
      true,
      "double"
    ],
    "semicolon": [
      true,
      "always"
    ],
    "typedef-whitespace": [
      true,
      {
        "call-signature": "nospace",
        "index-signature": "nospace",
        "parameter": "nospace",
        "property-declaration": "nospace",
        "variable-declaration": "nospace"
      }
    ],
    "variable-name": [
      true,
      "ban-keywords"
    ],
    "whitespace": [
      true,
      "check-branch",
      "check-decl",
      "check-operator",
      "check-separator",
      "check-type"
    ]
  }
};
