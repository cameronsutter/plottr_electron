var path = require('path')
var webpack = require('webpack')

var plugins = [
  new webpack.IgnorePlugin(/main/, /bin/),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    chunks: ['app', 'verify', 'report']
  })
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({compressor: {screw_ie8: true, warnings: false}}))
  plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}))
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: path.join('app', 'index'),
    css: path.join('css', 'index'),
    verify: path.join('verify', 'index'),
    report: path.join('report', 'index')
  },
  output: {
    path: path.resolve(__dirname, 'bin'),
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
      include: path.join('src', 'css')
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss', '.json'],
    root: path.resolve(__dirname, 'src'),
    modulesDirectories: ['node_modules', 'src/app', 'src/verify', 'src/css', 'src/report']
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
  plugins: plugins
}
