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
