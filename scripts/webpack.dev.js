const ip = require('ip');
const path = require('path');
const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.base');

const joinRoot = path.join.bind(path, __dirname, '..')

module.exports = merge(baseConfig, {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: [
    `webpack-dev-server/client?http://${ip.address()}:3000`,
    joinRoot('__demo__/scripts/index.ts')
  ],
  output: {
    path: joinRoot('.tmp'),
    filename: 'app.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        use: [
          {
            loader: 'eslint-loader',
          },
        ],
        include: [joinRoot('src'),joinRoot('__demo__')],
      },
    ],

  }
});

