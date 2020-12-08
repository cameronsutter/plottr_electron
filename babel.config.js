const isTest = process.env.NODE_ENV

module.exports = {
  "presets": [
    ["@babel/preset-react", {"useBuiltIns": true}],
    ["@babel/preset-env"]
  ],
  "plugins": [
    "lodash",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-transform-modules-commonjs",
    // this is done in webpack for the builds, so this is only
    // required for test
    isTest ? ["module-resolver", {
      "root": ["./src"],
      "alias": {
        "test-utils": "./test/test-utils",
      }
    }] : undefined,
  ]
}

//, {"modules": false, "targets": {"node": true}}