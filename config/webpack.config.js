const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

const walkSync = require("./source-files");

const dir = "src";
let getFilesFromDir = {};
walkSync(dir, function (filePath, stat) {
  getFilesFromDir[filePath.ext]
    ? getFilesFromDir[filePath.ext].push(filePath)
    : (getFilesFromDir[filePath.ext] = new Array()) &&
      getFilesFromDir[filePath.ext].push(filePath);
});


console.log(getFilesFromDir);

return;

// yapilmasi gereken getFilesFromDir den gelen obj'yi donerek HtmlWebpackPlugin ve entry leri olusturmak
// alttaki yorumlar ornek olarak yararlanilacak.

// const htmlPlugins = getFilesFromDir(HTML_DIR, [".html"]).map((filePath) => {
//   const fileName = filePath.replace(HTML_DIR, "");
//   return new HtmlWebpackPlugin({
//     chunks: [fileName.replace(path.extname(fileName), ""), "common"],
//     template: filePath,
//     filename: fileName,
//   });
// });

// const entry = getFilesFromDir(JS_DIR, [".js"]).reduce((obj, filePath) => {
//   const entryChunkName = filePath
//     .replace(path.extname(filePath), "")
//     .replace(JS_DIR, "");
//   obj[entryChunkName] = `./${filePath}`;
//   return obj;
// }, {});

const options = {
  output: {
    path: path.join(__dirname, "../build"),
    chunkFilename: "[name].[contenthash].bundle.js",
  },
  mode: process.env.ENV_MODE,
  devServer: process.env.ENV_MODE === "development" ? {} : {},
  optimization:
    process.env.ENV_MODE === "development"
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
                  drop_console: true,
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
    process.env.ENV_MODE === "development"
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

module.exports = {
  entry,
  output: { ...options.output },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.ProgressPlugin(),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: "[name].[hash:4].css",
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
          "css-loader",
          "sass-loader",
        ],
      },
      // html
      {
        test: /\.html$/i,
        use: "html-loader",
      },
      // file
      {
        test: /\.(png|jpg|jpe?g|svg|font|woff|ttf|woff2|eot)$/i,
        use: {
          loader: "file-loader",
          options: {
            name: "[name].[ext]",
            outputPath: "images",
            publicPath: "images",
          },
        },
      },
      // babel
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
