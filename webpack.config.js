const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: 'node',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: ['./src/index.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js',
    library: 'index',
    libraryTarget: 'commonjs2'
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: "This is a dependency for @aacassandra/parse-lib-js",
      entryOnly: true
    }),
    new webpack.IgnorePlugin(/^pg-native$/),
    new webpack.DefinePlugin({
      'process.env.BROWSER': false,
      __DEV__: process.env.NODE_ENV !== 'production',
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
          keep_fnames: true
        }
      })
    ]
  },
  module: {
    rules: [{
      test: /\.(mjs|js|jsx)$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-env',
          {
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ]
          }
        ]
      }
    }]
  }
};
