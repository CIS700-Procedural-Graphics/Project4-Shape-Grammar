const path = require('path');

module.exports = {
  entry: path.join(__dirname, "src/main"),
  output: {
     path: path.join(__dirname, "build"),
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
        test: /\.(obj|mtl)$/,
        loader: 'file?name=../assets/[name].[ext]'
     }
    ]
  },
  devtool: 'source-map',
  devServer: {
    port: 7000
  }
}
