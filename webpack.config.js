const path = require('path');
const webpack = require('webpack');

module.exports = {
  devServer: {
    contentBase: './example',
    historyApiFallback: true,
    compress: true,
    inline: true,
    hot: true,
    host: '0.0.0.0',
    port: 8087
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
    module: 'empty'
  },
  devtool: 'inline-source-map',
  entry: {
    index: './example/src/index.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, './example/dist'),
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        include: /src/,         
        exclude: /node_modules/,
      }
    ]
    
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin()
  ]
}

