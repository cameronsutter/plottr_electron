module.exports = {
  context: __dirname + '/',
  entry: './app/index',
  output: {
    path: __dirname + '/',
    filename: 'bundle.js',
    publicPath: '/compiled/'
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
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.css', '.scss'],
    root: __dirname + '/app'
  },
  target: 'atom'
}
