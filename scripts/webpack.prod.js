const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const baseConfig = require('./webpack.base')

const joinRoot = path.join.bind(path, __dirname, '..')

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: [joinRoot('src/index.ts')],
  output: {
    path: joinRoot('dist/'),
    filename: 'scrollxp.js',
    library: 'ScrollXP',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this',
  },
  plugins: [new UglifyJSPlugin(), new webpack.optimize.ModuleConcatenationPlugin()],
});
