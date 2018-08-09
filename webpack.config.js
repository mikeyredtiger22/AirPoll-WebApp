var path = require('path');

module.exports = {
  mode: 'development',
  watch: true,
  entry: './AirPollMain.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [{
      test: /\.js/,
      exclude: /node_modules/,
      loader: 'babel-loader'
    }]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map'
};

// module.exports = {
//   entry: './AirPollMain.js',
//   output: {
//     filename: 'main.js',
//     path: path.resolve(__dirname, 'dist')
//   },
//   mode: 'development'
// };