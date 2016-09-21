var path = require('path')
var webpack = require('webpack')

var ignore = new webpack.IgnorePlugin(/main/, /bin/)

module.exports = {
  context: __dirname + '/src',
  entry: {
    app: './app/index',
    css: './css/index',
    verify: './verify/index',
    report: './report/index'
  },
  output: {
    path: __dirname + '/bin/',
    filename: '[name].bundle.js'
  },
  module: {
    loaders: [{
      test: /\.json$/,
      loader: 'json'
    }, {
      test: /\.js$/,
      loader: 'babel',
      include: path.resolve(__dirname, 'src')
    }, {
      test: /\.scss$/,
      loader: 'style-loader!css-loader!sass-loader',
      include: __dirname + './src/css'
    }, {
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=application/font-woff'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss', '.json'],
    root: __dirname + './src',
    modulesDirectories: ['node_modules', 'src/app', 'src/verify', 'src/css', 'src/report']
  },
  target: 'atom',
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
  plugins: [ignore]
}
