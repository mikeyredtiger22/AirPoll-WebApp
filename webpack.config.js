const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const Dotenv = require('dotenv-webpack');

module.exports = {
  entry: './AirPollMain.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: ['style-loader', MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin('build'),
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: 'nouislider.css',
    }),
    new HtmlWebpackPlugin({
      title: 'AirPoll',
      inject: true,
      template: 'index.html',
    }),
  ],
  stats: {
    colors: true,
  },
  devtool: 'source-map',
};
