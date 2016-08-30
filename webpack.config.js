module.exports = {
  context: __dirname + '/',
  entry: './app/index',
  output: {
    path: __dirname + '/',
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel',
      exclude: /node_modules/,
      include: __dirname
    }, {
      test: /\.scss$/,
      loader: 'style-loader!css-loader!sass-loader',
      include: __dirname + './app/css',
      exclude: /node_modules/
    }, { 
      test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
      loader: 'url?limit=10000&mimetype=application/font-woff'
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss'],
    root: __dirname + '/app'
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
  ]
}
