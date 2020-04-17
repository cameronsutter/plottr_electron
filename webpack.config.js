var path = require('path')
var webpack = require('webpack')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

var plugins = [
  new webpack.IgnorePlugin(/main/, /bin/),
  new webpack.DefinePlugin({'__REACT_DEVTOOLS_GLOBAL_HOOK__': '({ isDisabled: true })'}),
]

if (process.env.NODE_ENV == 'dev') {
  plugins.push(new BundleAnalyzerPlugin())
}

if (process.env.NODE_ENV !== 'dev') {
  plugins.push(new webpack.DefinePlugin({'process.env.NODE_ENV': JSON.stringify('production')}))
  plugins.push(new webpack.IgnorePlugin(/regenerator|nodent|js\-beautify/, /ajv/))
}

module.exports = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: path.resolve('.', 'src', 'app', 'index.js'),
    css: path.resolve('.', 'src', 'css', 'index'),
    verify: path.resolve('.', 'src', 'verify', 'index'),
    expired: path.resolve('.', 'src', 'expired', 'index'),
    dashboard: path.resolve('.', 'src', 'dashboard', 'index'),
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
    }, {
      test: /\.(png|jpg|gif)$/,
      loader: 'url-loader',
      query: {
        limit: 1048576,
      },
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.json', '.jpg'],
    modules: ['node_modules', 'src/app', 'src/verify', 'src/css', 'src/expired', 'src/dashboard'],
    alias: {
      'lodash': 'lodash-es',
      'lodash.isequal': 'lodash-es/isEqual',
      'lodash.debounce': 'lodash-es/debounce',
      'lodash.pick': 'lodash-es/pick',
    }
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
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
        reactIcons: {
          name: 'reactIcons',
          chunks: 'all',
          test (module) {
            return module.resource && module.resource.includes('react-icons')
          },
          filename: '[name].bundle.js'
        }
      }
    }
  }
}
