const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const options = {
  output: { chunkFilename: "[name].[contenthash].bundle.js" },
  mode: process.env.ENV_MODE,
  devServer: process.env.ENV_MODE === "development" ? {} : {},
  optimization:
    process.env.ENV_MODE === "development"
      ? {}
      : {
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                sourceMap: false,
                compress: {
                  drop_console: true,
                },
              },
            }),
          ],
        },
  htmlPlugin:
    process.env.ENV_MODE === "development"
      ? {}
      : {
          removeComments: true,
          removeAttributeQuotes: true,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
          preserveLineBreaks: true,
          minifyURLs: true,
        },
};

module.exports = {
  entry: {
    main: "./src/main.js",
    catalog: "./src/catalog.js",
    product: "./src/product.js",
  },
  output: { ...options.output },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      chunks: ["main"],
      minify: {
        ...options.htmlPlugin,
      },
    }),
    new HtmlWebpackPlugin({
      filename: "catalog.html",
      template: "./src/catalog.html",
      chunks: ["main", "catalog"],
      minify: {
        ...options.htmlPlugin,
      },
    }),
    new HtmlWebpackPlugin({
      filename: "product.html",
      template: "./src/product.html",
      chunks: ["product"],
      minify: {
        ...options.htmlPlugin,
      },
    }),
    new MiniCssExtractPlugin({
      filename: "[name].[hash:4].css",
    }),
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          // "style-loader",
          MiniCssExtractPlugin.loader,
          "css-loader",
          "sass-loader",
        ],
      },
      {
        test: /\.html$/i,
        use: "html-loader",
      },
      {
        test: /\.(png|jpg|jpe?g|svg)$/i,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[hash:4].[ext]",
            outputPath: "images",
            publicPath: "images",
          },
        },
      },
      {
        test: /\.?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  devServer: { ...options.devServer },
  optimization: { ...options.optimization },
  mode: options.mode,
};
