var path = require('path')
var webpack = require('webpack')
var packageJSON = require('./package.json')
var DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')
const isForMaps = process.env.MAPS == 'true'
const sourceMapsPath = path.resolve(__dirname, '..', '..', 'pltr_sourcemaps', packageJSON.version)

var plugins = [
  new webpack.IgnorePlugin(/main/, /bin/),
  new webpack.DefinePlugin({ __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })' }),
]

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// if (process.env.NODE_ENV == 'dev') {
//   plugins.push(new BundleAnalyzerPlugin())
// }

if (process.env.NODE_ENV !== 'dev') {
  plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': JSON.stringify('production') }))
  plugins.push(new webpack.IgnorePlugin(/regenerator|nodent|js-beautify/, /ajv/))
  plugins.push(
    new webpack.SourceMapDevToolPlugin({
      append: `\n//# sourceMappingURL=https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/main/${packageJSON.version}/[url]`,
      filename: '[name].map',
    })
  )
}

const mainConfig = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'main'),
  entry: {
    main: path.resolve('.', 'main', 'index.js'),
  },
  output: {
    path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
    filename: 'electron_main.js',
  },
  resolve: {
    extensions: ['.js', '.json'],
    modules: ['node_modules', 'main'],
  },
  target: 'electron-main',
  plugins: [...plugins, new DuplicatePackageCheckerPlugin()],
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  node: {
    __dirname: false,
  },
}

const rendererConfig = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: path.resolve('.', 'src', 'app', 'index.js'),
    // Split these out from main so that we can do early
    // initialisation on things like i18 setup.
    appDependencies: path.resolve('.', 'src', 'app', '_index.js'),
    css: path.resolve('.', 'src', 'css', 'index'),
  },
  output: {
    path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
        },
      },
      {
        test: /\.scss$/,
        loader: 'sass-loader',
        include: path.resolve(__dirname, 'src', 'css'),
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
        query: {
          limit: 1048576,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.scss', '.json', '.jpg'],
    modules: ['node_modules', 'src/app', 'test'],
    alias: {
      app: path.resolve(__dirname, 'src', 'app'),
      css: path.resolve(__dirname, 'src', 'css'),
      test: path.resolve(__dirname, 'test'),
      'connected-components': path.resolve(__dirname, 'src', 'connected-components.js'),
      plottr_components: path.resolve(__dirname, 'lib', 'plottr_components', 'dist', 'components'),
      // Avoid duplicate react in libs problem (see
      // https://medium.com/@penx/managing-dependencies-in-a-node-package-so-that-they-are-compatible-with-npm-link-61befa5aaca7)
      // If a better solution arose since this was written then feel
      // free to replace this! :)
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-redux': path.resolve('./node_modules/react-redux'),
      redux: path.resolve('./node_modules/redux'),
    },
  },
  target: 'electron-renderer',
  externals: [
    (function () {
      var IGNORES = ['electron']
      return function (context, request, callback) {
        if (IGNORES.indexOf(request) >= 0) {
          return callback(null, 'require("' + request + '")')
        }
        return callback()
      }
    })(),
  ],
  plugins: plugins,
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  optimization: {
    splitChunks: {
      cacheGroups: {
        reactIcons: {
          name: 'reactIcons',
          priority: 10,
          chunks: 'all',
          test(module) {
            return module.resource && module.resource.includes('react-icons')
          },
        },
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
      },
    },
  },
}

module.exports = [rendererConfig, mainConfig]
