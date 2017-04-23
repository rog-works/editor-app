const webpack = require('webpack');

function externalModules() {
	const fs = require('fs');
	const modules = {};
	fs.readdirSync('node_modules')
		.filter(function(dir) {
			return ['.bin'].indexOf(dir) === -1;
		})
		.forEach((name) => {
			modules[name] = 'commonjs ' + name;
		});
	return modules;
}

module.exports = {
	entry: `${__dirname}/src/Index.ts`,
	output: {
		path: `${__dirname}/`,
		filename: 'bundle.js'
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
	externals: externalModules()
};
