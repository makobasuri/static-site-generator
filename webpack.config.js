const path = require('path');
const webpack = require('webpack');

module.exports = {
	context: __dirname,
	entry: './js/main.js',
	output: {
		path: path.resolve(__dirname, 'build/js'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['env']
					}
				}
			}
		]
	},
	plugins: [
		new webpack.optimize.UglifyJsPlugin(),
	]
};
