var path = require('path')
var webpack = require('webpack')

var plugins = [
  new webpack.IgnorePlugin(/main/, /bin/),
  new webpack.optimize.CommonsChunkPlugin({
    name: 'common',
    chunks: ['app', 'verify']
  })
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(new webpack.optimize.UglifyJsPlugin({compressor: {screw_ie8: true, warnings: false}}))
  plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}))
  plugins.push(new webpack.IgnorePlugin(/regenerator|nodent|js\-beautify/, /ajv/))
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: path.join('app', 'index'),
    css: path.join('css', 'index'),
    verify: path.join('verify', 'index')
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
      include: path.resolve(__dirname, 'src'),
      exclude: /node_modules/,
      query: {
        presets: ['react', 'es2015', 'stage-2'],
        cacheDirectory: true
      }
    }, {
      test: /\.scss$/,
      loader: 'style-loader!css-loader!sass-loader',
      include: path.join('src', 'css')
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss', '.json'],
    root: path.resolve(__dirname, 'src'),
    modulesDirectories: ['node_modules', 'src/app', 'src/verify', 'src/css']
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
