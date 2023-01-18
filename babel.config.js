module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false, targets: { node: true } }],
    ['@babel/preset-react', { runtime: 'automatic', useBuiltIns: true }],
  ],
  plugins: process.env.NODE_ENV === 'test' ? ['@babel/plugin-transform-modules-commonjs'] : [],
}
