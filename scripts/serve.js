'use strict';

const ip = require('ip');
const path = require('path');
const Webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.dev');

const options = {
  static: {
    directory: path.join(__dirname, '..', '__demo__'),
  },
  open: true,
  port: 3000
};

const compiler = Webpack(config);

const server = new WebpackDevServer(options, compiler);
server.startCallback(() => {
  console.log('Listening at http://localhost:3000');
  console.log(`Remote access: http://${ip.address()}:3000`)
});
