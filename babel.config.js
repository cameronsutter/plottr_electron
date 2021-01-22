const isTest = process.env.NODE_ENV

// had to do it this way because the windows build (Appveyor) blows up if there is an undefined in the plugins
let plugins = [
  "lodash",
  "@babel/plugin-proposal-class-properties",
  "@babel/plugin-transform-modules-commonjs",
]

// this is done in webpack for the builds, so this is only
// required for test
if (isTest) {
  plugins.push(["module-resolver", {
    "root": ["./src/app", "./src/css", "./src/dashboard"],
    "alias": {
      "test-utils": "./test/test-utils",
    }
  }])
}

module.exports = {
  "presets": [
    ["@babel/preset-react", {"useBuiltIns": true}],
    ["@babel/preset-env", {"modules": false, "targets": {"node": true}}]
  ],
  "plugins": plugins,
}
