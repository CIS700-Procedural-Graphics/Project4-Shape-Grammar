const path = require('path');

module.exports = {
  context: __dirname + '/src',
  entry: path.join(__dirname, "src/main"),
  output: {
    filename: "./bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.glsl$/,
        loader: "webpack-glsl"
      },
      {
        test: /\.mtl$/,
        loader: 'three-mtl-loader'
      },
      {
        test: /\.obj$/,
        loader: 'jser-three-obj-loader'
      }
    ]
  },
  devtool: 'source-map',
  devServer: {
    port: 7000
  }
}