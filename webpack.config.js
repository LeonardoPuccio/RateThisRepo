const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.ts',
    content: './src/content.ts',
    'popup/popup': './src/popup/popup.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true // This will clean the output directory before each build
  },
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
        { from: './src/manifest.json', to: 'manifest.json' },
        { from: './src/icons', to: 'icons' }
      ],
    }),
  ]
};
