const path = require('path');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const DIST = path.resolve(__dirname, 'public');
const prefix = require('./package.json').homepage;

module.exports = (_, argv) => {
  const isProd = argv.mode === 'production';
  const htmlwebpackOptions = isProd ? { publicPath: prefix } : undefined;

  let extraOptions = {};

  if (isProd === false) {
    extraOptions = {
      devtool: 'inline-source-map',
    };
  }

  const config = Object.assign(extraOptions, {
    mode: argv.mode || 'development',
    entry: './src/index.ts',
    output: {
      filename: 'bundle.js',
      path: DIST,
      publicPath: DIST,
    },
    devServer: {
      devMiddleware: {
        writeToDisk: true,
      },
      static: [DIST],
      port: 3000,
    },
    plugins: [
      new HtmlWebpackPlugin(htmlwebpackOptions),
      new NodePolyfillPlugin(),
    ],
    module: {
      rules: [
        {
          test: /\.ts?$/u,
          use: 'ts-loader',
          exclude: /node_modules/u,
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
  });

  return config;
};
