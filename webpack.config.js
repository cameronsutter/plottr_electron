module.exports = {
  context: __dirname + '/',
  entry: './app/entry',
  output: {
    path: __dirname + '/',
    filename: 'plottr.js'
  },
  module: {
    loaders: [{
      test: /\.jsx$/,
      loader: 'jsx-loader'
    }, {
      test: /\.scss$/,
      loaders: 'style!css!sass'
    }]
  },
  resolve: {
    extensions: ["", ".js", ".jsx"],
    root: __dirname + '/app',
  },
  target: "atom"
};
