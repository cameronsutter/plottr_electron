module.exports = {
  stories: [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-create-react-app"
  ],
  babel: async (options) => ({
    ...options,
    presets: [
      ...options.presets,
      [
	'@babel/preset-react', {
	  runtime: 'automatic',
	},
        'preset-react-jsx-transform'
      ],
    ],
  }),
}
