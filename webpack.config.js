/* eslint-disable */
'use strict';
const path = require('path');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const HtmlMinimizerPlugin = require('html-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env) => {
  const isDev = !(env || {}).production;
  const commonCssLoaders = (otherLoaders = []) =>
    [
      MiniCssExtractPlugin.loader,
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1 + otherLoaders.length,
        },
      },
      {
        loader: 'postcss-loader', // Run post css actions
        options: {
          postcssOptions: {
            ident: 'postcss',
            syntax: 'postcss-scss',
            plugins: [require('tailwindcss'), require('autoprefixer')],
          },
        },
      },
    ].concat(otherLoaders);

  return {
    devtool: isDev ? 'eval-cheap-module-source-map' : 'source-map',
    entry: [
      path.resolve(__dirname, 'src/index.scss'),
      path.resolve(__dirname, 'src/index.js'),
      path.resolve(__dirname, 'src/index.html'),
    ],
    cache: isDev
      ? {
          type: 'filesystem',
          cacheDirectory: path.resolve(__dirname, '.webpack_cache'),
          buildDependencies: {
            // This makes all dependencies of this file - build dependencies
            config: [__filename],
          },
        }
      : false,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].[contenthash:6].js',
    },
    devServer: {
      contentBase: path.resolve(__dirname, '.build'),
      hot: true,
    },
    module: {
      rules: [
        // {
        //   test: /\.js$/,
        //   exclude: /node_modules/,
        //   use: {
        //     loader: 'babel-loader',
        //     options: {
        //       presets: ['@babel/preset-env'],
        //     },
        //   },
        // },
        {
          test: /\.html$/i,
          use: [
            'file-loader?name=[name].[ext]',
            'extract-loader',
            'html-loader',
          ],
        },
        {
          test: /\.s(c|a)ss$/,
          use: commonCssLoaders(['sass-loader']),
        },
        {
          test: /\.(css)$/,
          use: commonCssLoaders(),
        },
      ],
    },
    resolve: {
      extensions: ['.js', '.css', '.scss', '.sass', '.html'],
    },
    mode: isDev ? 'development' : 'production',
    plugins: [
      new CleanWebpackPlugin(),
      new MiniCssExtractPlugin({
        filename: '[name].[contenthash:6].css',
      }),
    ],
    optimization: {
      minimizer: ['...', new HtmlMinimizerPlugin(), new CssMinimizerPlugin()],
    },
  };
};
