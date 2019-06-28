var path = require('path')
var webpack = require('webpack')

var plugins = [
  new webpack.IgnorePlugin(/main/, /bin/),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({compressor: {screw_ie8: true, warnings: false}}))
  plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}))
  plugins.push(new webpack.IgnorePlugin(/regenerator|nodent|js\-beautify/, /ajv/))
}

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: path.resolve('.', 'src', 'app', 'index.js'),
    css: path.resolve('.', 'src', 'css', 'index'),
    verify: path.resolve('.', 'src', 'verify', 'index')
  },
  output: {
    path: path.resolve(__dirname, 'bin'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [{
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
        },
      }, {
        test: /\.scss$/,
        loader: 'sass-loader',
        include: path.resolve(__dirname, 'src', 'css'),
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.json'],
    modules: ['node_modules', 'src/app', 'src/verify', 'src/css'],
  },
  target: 'electron-renderer',
  externals: [
    (function () {
      var IGNORES = [
        'electron'
      ]
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, 'require("' + request + '")')
        }
        return callback()
      }
    })()
  ],
  plugins: plugins,
  devServer: {
    port: 9001,
    host: 'localhost',
  }
}
