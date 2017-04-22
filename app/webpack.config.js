const webpack = require('webpack');

module.exports = {
	entry: `${__dirname}/src/Index.ts`,
	output: {
		path: `${__dirname}/`,
		filename: 'index.js'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	node: {
		__filename: false,
		__dirname: false
	},
	target: 'node',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader'
			},
			{
				test: /\.html$/,
				use: 'raw-loader'
			}
		]
	},
	plugins: [
		// new webpack.optimize.UglifyJsPlugin()
	],
	watchOptions: {
		poll: 500
	},
	devtool: 'source-map'
};
