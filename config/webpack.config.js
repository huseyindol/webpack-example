const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const walkSync = require('./source-files');

const dir = 'src';
let getFilesFromDir = {};
walkSync(dir, function (filePath, stat) {
  getFilesFromDir[filePath.ext]
    ? getFilesFromDir[filePath.ext].push(filePath)
    : (getFilesFromDir[filePath.ext] = new Array()) && getFilesFromDir[filePath.ext].push(filePath);
});

const options = {
  output: {
    path: path.join(__dirname, '../build'),
    filename: '[name].[contenthash].bundle.js',
  },
  mode: process.env.ENV_MODE,
  devServer: process.env.ENV_MODE === 'development' ? {} : {},
  optimization:
    process.env.ENV_MODE === 'development'
      ? {}
      : {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              parallel: true,
              terserOptions: {
                sourceMap: true,
                warnings: false,
                compress: {
                  // drop_console: true,
                  comparisons: false,
                },
                parse: {},
                mangle: true,
                output: {
                  comments: false,
                  ascii_only: true,
                },
              },
            }),
          ],
        },
  htmlPlugin:
    process.env.ENV_MODE === 'development'
      ? {}
      : {
          removeAttributeQuotes: true,
          collapseInlineTagWhitespace: true,
          preserveLineBreaks: true,
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
};

const htmlPlugins = getFilesFromDir.html.map((html) => {
  return new HtmlWebpackPlugin({
    chunks: [html.chunks],
    template: html.filepath,
    filename: `${html.chunks}.html`,
    minify: {
      ...options.htmlPlugin,
    },
  });
});

const entry = getFilesFromDir.js.reduce((obj, js) => {
  obj[js.chunks] = `./${js.filepath}`;
  return obj;
}, {});

module.exports = {
  entry,
  output: {
    ...options.output,
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    ...htmlPlugins,
  ],
  module: {
    rules: [
      // css
      {
        test: /\.s[ac]ss$/i,
        use: [
          // "style-loader",
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      // html
      {
        test: /\.html$/i,
        use: 'html-loader',
      },
      // file
      {
        test: /\.(png|jpg|jpe?g|svg|font|woff|ttf|woff2|eot)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'images',
            publicPath: 'images',
          },
        },
      },
      // babel
      {
        test: /\.?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devServer: { ...options.devServer },
  optimization: { ...options.optimization },
  mode: options.mode,
};
