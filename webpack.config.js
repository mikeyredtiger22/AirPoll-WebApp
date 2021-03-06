const path = require('path');
const Dotenv = require('dotenv-webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

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
      {
        test: /\.(png)$/,
        use: [
          {
            loader: 'file-loader',
            options: {}
          }
        ]
      }
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, 'build'),
    open: true
  },
  plugins: [
    new CleanWebpackPlugin('build'),
    new Dotenv(),
    new MiniCssExtractPlugin({
      filename: 'nouislider.css',
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      favicon: 'favicon.png',
      inject: 'head', //This is so that the app bundle in loaded before the google maps library callback.
      minify: {
        collapseWhitespace: true,
        removeComments: true
      }
    }),
  ],
  stats: {
    colors: true,
  },
  devtool: 'source-map',
};
