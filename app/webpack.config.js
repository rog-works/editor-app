const webpack = require('webpack');

// function externalModules() {
// 	return {
// 		'express': 'commonjs express',
// 		'morgan': 'commonjs morgan',
// 		'body-parser': 'commonjs body-parser',
// 		'glob': 'commonjs glob',
// 		'crypto-js': 'commonjs crypto-js',
// 		'socket.io': 'commonjs socket.io',
// 		'node': 'commonjs node',
// 		'jquery': 'commonjs jquery', // FIXME
// 		'knockout': 'commonjs knockout', // FIXME
// 		'knockout-es5': 'commonjs knockout-es5', // FIXME
// 		'ace': 'commonjs ace' // FIXME
// 	}
// }

module.exports = {
	entry: {
		// server: `${__dirname}/src/Index.ts`,
		client: `${__dirname}/src/public/Client.ts`
	},
	output: {
		path: `${__dirname}/`,
		filename: '[name].bundle.js'
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	// node: {
	// 	__filename: false,
	// 	__dirname: false
	// },
	// target: 'node',
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: 'ts-loader',
				exclude: /node_modules/
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
	devtool: 'source-map',
	// externals: externalModules()
};
