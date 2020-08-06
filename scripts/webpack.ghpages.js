const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
// const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const baseConfig = require('./webpack.base');

const joinRoot = path.join.bind(path, __dirname, '..');

module.exports = merge(baseConfig, {
  mode: 'production',
  entry: [
    joinRoot('__demo__/scripts/index.ts'),
  ],
  output: {
    path: joinRoot('.tmp'),
    filename: 'app.js',
    publicPath: '/',
  },
  module: {
    rules: [{
      include: [
        joinRoot('__demo__'),
      ],
    }],
  },
  plugins: [
    // new UglifyJSPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
});
