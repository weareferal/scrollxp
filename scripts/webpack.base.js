const path = require('path');
const webpack = require('webpack');

const joinRoot = path.join.bind(path, __dirname, '..')

module.exports = {
  resolve: {
    extensions: ['.js', '.ts'],
    alias: {
      'scrollxp': joinRoot('src'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                declaration: false,
              },
            },
          },
        ],
        include: [joinRoot('src'), joinRoot('__demo__')],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __SCROLLXP_VERSION__: JSON.stringify(process.env.SCROLLXP_VERSION || require('../package.json').version),
    }),
  ],
  stats: {
    modules: false,
  },
}
