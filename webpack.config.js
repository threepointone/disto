// import webpack from 'webpack';
var path = require('path');

module.exports = {
  devtool: 'source-map',
  target: 'web',
  entry: {
    _rest: ['./_rest/app.js'],
    _simple: ['./_simple/index.js']

  },
  output: {
    path: __dirname,
    filename: '[name]/bundle.js',
    publicPath: '/'
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loaders: ['babel-loader']
    }]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: []
};
