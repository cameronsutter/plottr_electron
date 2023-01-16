const path = require('path')
const webpack = require('webpack')
const packageJSON = require('./package.json')
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')
const isForMaps = process.env.MAPS == 'true'
const sourceMapsPath = path.resolve(__dirname, '..', '..', 'pltr_sourcemaps', packageJSON.version)
const Dotenv = require('dotenv-webpack')
const CircularDependencyPlugin = require('circular-dependency-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const plugins = [
  new webpack.IgnorePlugin({ resourceRegExp: /main/, contextRegExp: /bin/ }),
  new webpack.DefinePlugin({ __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })' }),
  new Dotenv(),
]

const defineConfig = [
  {
    global: {},
  },
]

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
// if (process.env.NODE_ENV == 'dev') {
//   plugins.push(new BundleAnalyzerPlugin())
// }

defineConfig.LOGGER = JSON.stringify('false')

if (process.env.NODE_ENV === 'dev' && process.env.LOGGER === 'true') {
  console.log('[Define Plugin] Adding LOGGER to process.env.')
  defineConfig.LOGGER = JSON.stringify('true')
}

if (process.env.NODE_ENV !== 'dev') {
  defineConfig.push({ 'process.env.NODE_ENV': JSON.stringify('production') })
  plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /regenerator|nodent|js-beautify/,
      contextRegExp: /ajv/,
    })
  )
  plugins.push(
    new webpack.SourceMapDevToolPlugin({
      append: `\n//# sourceMappingURL=https://raw.githubusercontent.com/Plotinator/pltr_sourcemaps/main/${packageJSON.version}/[url]`,
      filename: '[name].map',
    })
  )
}

plugins.push(new BundleAnalyzerPlugin())

plugins.push(new webpack.DefinePlugin(defineConfig))

const mainCircularDependencyChecker = new CircularDependencyPlugin({
  // exclude detection of files based on a RegExp
  exclude: /node_modules/,
  // include specific files based on a RegExp
  include: /main/,
  // add errors to webpack instead of warnings
  failOnError: true,
  // allow import cycles that include an asyncronous import,
  // e.g. via import(/* webpackMode: "weak" */ './file.js')
  allowAsyncCycles: false,
  // set the current working directory for displaying module paths
  cwd: process.cwd(),
})

const duplicateDependencyChecker = new DuplicatePackageCheckerPlugin()

// const mainConfig = {
//   mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
//   watch: process.env.NODE_ENV === 'dev',
//   context: path.resolve(__dirname, 'main'),
//   entry: {
//     main: path.resolve('.', 'main', 'index.js'),
//   },
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         include: path.resolve(__dirname, 'lib', 'pltr'),
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   output: {
//     path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
//     filename: 'electron_main.js',
//   },
//   resolve: {
//     extensions: ['.js', '.json'],
//     modules: ['node_modules', 'main'],
//     alias: {
//       plottr_locales: path.resolve('./node_modules/plottr_locales'),
//     },
//   },
//   target: 'electron-main',
//   plugins: [...plugins, duplicateDependencyChecker, mainCircularDependencyChecker],
//   devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
//   node: {
//     __dirname: false,
//   },
//   externals: {
//     sharp: 'commonjs sharp',
//   },
// }

// const preloadConfig = {
//   mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
//   watch: process.env.NODE_ENV === 'dev',
//   context: path.resolve(__dirname, 'main'),
//   entry: {
//     preload: path.resolve('.', 'main', 'modules', 'preload.js'),
//   },
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         include: path.resolve(__dirname, 'lib', 'pltr'),
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   output: {
//     path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
//     filename: 'preload.js',
//   },
//   resolve: {
//     extensions: ['.js', '.json'],
//     modules: ['node_modules', 'main'],
//   },
//   target: 'electron-main',
//   plugins: [...plugins, duplicateDependencyChecker, mainCircularDependencyChecker],
//   devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
//   node: {
//     __dirname: false,
//   },
// }

// const appCircularDependencyChecker = new CircularDependencyPlugin({
//   // exclude detection of files based on a RegExp
//   exclude: /node_modules/,
//   // include specific files based on a RegExp
//   include: /app/,
//   // add errors to webpack instead of warnings
//   failOnError: true,
//   // allow import cycles that include an asyncronous import,
//   // e.g. via import(/* webpackMode: "weak" */ './file.js')
//   allowAsyncCycles: false,
//   // set the current working directory for displaying module paths
//   cwd: process.cwd(),
// })

const rendererConfig = {
  mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
  watch: process.env.NODE_ENV === 'dev',
  context: path.resolve(__dirname, 'src'),
  entry: {
    app: path.resolve('.', 'src', 'app', 'index.js'),
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
        include: path.resolve(__dirname, 'lib', 'pltr'),
        exclude: /node_modules/,
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, 'src'),
        exclude: /node_modules/,
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
      },
    ],
  },
  resolve: {
    extensions: ['.esm.js', '.mjs', '.js', '.jsx', '.css', '.scss', '.json', '.jpg'],
    modules: ['node_modules', 'src/app', 'test'],
    alias: {
      app: path.resolve(__dirname, 'src', 'app'),
      css: path.resolve(__dirname, 'src', 'css'),
      test: path.resolve(__dirname, 'test'),
      'connected-components': path.resolve(__dirname, 'src', 'connected-components.js'),
      'wired-up-firebase': path.resolve(__dirname, 'src', 'wired-up-firebase.js'),
      'world-api': path.resolve(__dirname, 'src', 'world.js'),
      plottr_components: path.resolve(
        __dirname,
        'lib',
        'plottr_components',
        'dist',
        'components.bundle.js'
      ),
      // Avoid duplicate react in libs problem (see
      // https://medium.com/@penx/managing-dependencies-in-a-node-package-so-that-they-are-compatible-with-npm-link-61befa5aaca7)
      // If a better solution arose since this was written then feel
      // free to replace this! :)
      react: path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
      'react-redux': path.resolve('./node_modules/react-redux'),
      redux: path.resolve('./node_modules/redux'),
      plottr_locales: path.resolve('./node_modules/plottr_locales'),
      // Force firebase to use the browser builds rather than node builds
      '@firebase/auth/internal': path.resolve(
        __dirname,
        'node_modules/@firebase/auth/dist/esm2017/internal.js'
      ),
      '@firebase/auth': path.resolve(
        __dirname,
        'node_modules/@firebase/auth/dist/esm2017/index.js'
      ),
      '@firebase/app': path.resolve(
        __dirname,
        'node_modules/@firebase/app/dist/esm/index.esm2017.js'
      ),
      '@firebase/firestore': path.resolve(
        __dirname,
        'node_modules/@firebase/firestore/dist/index.esm2017.js'
      ),
      '@firebase/storage': path.resolve(
        __dirname,
        'node_modules/@firebase/storage/dist/index.esm2017.js'
      ),
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      http: require.resolve('stream-http'),
      assert: require.resolve('assert/'),
      crypto: require.resolve('crypto-browserify'),
      url: require.resolve('url/'),
    },
  },
  target: 'web',
  plugins: [duplicateDependencyChecker, ...plugins],
  devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
  optimization: { splitChunks: false },
  externals: {
    sharp: 'sharp',
  },
}

// const loginPopupConfig = {
//   mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
//   watch: process.env.NODE_ENV === 'dev',
//   context: path.resolve(__dirname, 'src'),
//   entry: {
//     loginApp: path.resolve('.', 'src', 'app', 'login.js'),
//     loginCSS: path.resolve('.', 'src', 'css', 'index'),
//   },
//   output: {
//     path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
//     filename: '[name].bundle.js',
//   },
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         include: path.resolve(__dirname, 'lib', 'pltr'),
//         exclude: /node_modules/,
//       },
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         include: path.resolve(__dirname, 'src'),
//         exclude: /node_modules/,
//       },
//       {
//         test: /\.scss$/,
//         loader: 'sass-loader',
//         include: path.resolve(__dirname, 'src', 'css'),
//       },
//       {
//         test: /\.css$/,
//         use: ['style-loader', 'css-loader'],
//       },
//       {
//         test: /\.(png|jpg|gif)$/,
//         loader: 'url-loader',
//       },
//     ],
//   },
//   resolve: {
//     extensions: ['.js', '.jsx', '.css', '.scss', '.json', '.jpg'],
//     modules: ['node_modules', 'src/app', 'test'],
//     alias: {
//       app: path.resolve(__dirname, 'src', 'app'),
//       css: path.resolve(__dirname, 'src', 'css'),
//       test: path.resolve(__dirname, 'test'),
//       'connected-components': path.resolve(__dirname, 'src', 'connected-components.js'),
//       'wired-up-firebase': path.resolve(__dirname, 'src', 'wired-up-firebase.js'),
//       'world-api': path.resolve(__dirname, 'src', 'world.js'),
//       plottr_components: path.resolve(__dirname, 'lib', 'plottr_components', 'dist', 'components'),
//       // Avoid duplicate react in libs problem (see
//       // https://medium.com/@penx/managing-dependencies-in-a-node-package-so-that-they-are-compatible-with-npm-link-61befa5aaca7)
//       // If a better solution arose since this was written then feel
//       // free to replace this! :)
//       react: path.resolve('./node_modules/react'),
//       docx: path.resolve('./node_modules/docx'),
//       'react-dom': path.resolve('./node_modules/react-dom'),
//       'react-redux': path.resolve('./node_modules/react-redux'),
//       redux: path.resolve('./node_modules/redux'),
//       plottr_locales: path.resolve('./node_modules/plottr_locales'),
//       // Force firebase to use the browser builds rather than node builds
//       '@firebase/auth/internal': path.resolve(
//         __dirname,
//         'node_modules/@firebase/auth/dist/esm2017/internal.js'
//       ),
//       '@firebase/auth': path.resolve(
//         __dirname,
//         'node_modules/@firebase/auth/dist/esm2017/index.js'
//       ),
//       '@firebase/app': path.resolve(
//         __dirname,
//         'node_modules/@firebase/app/dist/esm/index.esm2017.js'
//       ),
//       '@firebase/firestore': path.resolve(
//         __dirname,
//         'node_modules/@firebase/firestore/dist/index.esm2017.js'
//       ),
//       '@firebase/storage': path.resolve(
//         __dirname,
//         'node_modules/@firebase/storage/dist/index.esm2017.js'
//       ),
//     },
//   },
//   target: 'web',
//   plugins: [appCircularDependencyChecker, duplicateDependencyChecker, ...plugins],
//   devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
//   optimization: { splitChunks: false },
//   externals: {
//     sharp: 'sharp',
//   },
// }

// // PROBLEM SEEMS TO BE THAT PLOTTR_IMPORT_EXPORT STILL USES NODE
// // DEPENDENCIES.

// const socketServerConfig = {
//   mode: process.env.NODE_ENV === 'dev' ? 'development' : 'production',
//   watch: process.env.NODE_ENV === 'dev',
//   context: path.resolve(__dirname, 'main'),
//   entry: {
//     socketServer: path.resolve('.', 'main', 'server', 'server.js'),
//   },
//   output: {
//     path: isForMaps ? sourceMapsPath : path.resolve(__dirname, 'bin'),
//     filename: '[name].bundle.js',
//   },
//   module: {
//     rules: [
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         include: path.resolve(__dirname, 'lib', 'pltr'),
//         exclude: /node_modules/,
//       },
//       {
//         test: /\.js$/,
//         loader: 'babel-loader',
//         include: path.resolve(__dirname, 'src'),
//         exclude: /node_modules/,
//       },
//     ],
//   },
//   resolve: {
//     extensions: ['.js', '.json'],
//     modules: ['main', 'node_modules'],
//     alias: {
//       docx: path.resolve('./node_modules/docx'),
//       plottr_locales: path.resolve('./node_modules/plottr_locales'),
//     },
//   },
//   target: 'node',
//   plugins: [appCircularDependencyChecker, duplicateDependencyChecker, ...plugins],
//   devtool: process.env.NODE_ENV === 'dev' ? 'eval' : false,
//   optimization: { splitChunks: false },
//   externals: {
//     sharp: 'sharp',
//   },
// }

module.exports = [rendererConfig, // mainConfig, preloadConfig
                  // , loginPopupConfig, socketServerConfig
                 ]
