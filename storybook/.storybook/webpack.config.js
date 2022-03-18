const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin')

const path = require('path')
module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader'),
    options: {
      presets: [['react-app', { flow: false, typescript: true }]],
    },
  })
  config.resolve.alias = {
    ...config.resolve.alias,
    fs: path.resolve(__dirname, 'fsMock.js'),
  }
  config.resolve.plugins = config.resolve.plugins.filter(
    (plugin) => !(plugin instanceof ModuleScopePlugin)
  )

  config.resolve.extensions.push('.ts', '.tsx')
  return config
}
