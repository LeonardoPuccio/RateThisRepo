const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

// Determine environment
const IS_DEV = process.env.NODE_ENV === 'development';
const DEBUG = IS_DEV; // Debug is enabled in development mode only

module.exports = {
  mode: IS_DEV ? 'development' : 'production',
  entry: {
    background: './src/background.ts',
    content: './src/content.ts',
    'popup/popup': './src/popup/popup.ts',
    'options/options': './src/options/options.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  devtool: IS_DEV ? 'inline-source-map' : false,
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './src/popup/popup.html', to: 'popup/popup.html' },
        { from: './src/popup/popup.css', to: 'popup/popup.css' },
        { from: './src/options/options.html', to: 'options/options.html' },
        { from: './src/manifest.json', to: 'manifest.json' },
        { from: './src/icons', to: 'icons' }
      ],
    }),
    new webpack.DefinePlugin({
      __DEBUG__: JSON.stringify(DEBUG)
    })
  ]
};
