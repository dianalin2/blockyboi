const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBundleAnalyzer = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const mode = process.env.NODE_ENV || 'production';

module.exports = {
    entry: './src/client/index.ts',
    mode: mode,
    devtool: mode === 'development' ? 'inline-source-map' : false,

    devServer: mode === 'development' ? {
        contentBase: path.resolve(__dirname, '../../dist/client'),
        hot: true,
    } : undefined,

    resolve: {
        alias: {
            three: path.resolve(__dirname, '../../node_modules/three')
        },
        extensions: ['.ts', '.tsx', '.js'],
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader', exclude: /node_modules/, options: { configFile: path.resolve(__dirname, 'tsconfig.json') } },
            { test: /\.js$/, loader: 'source-map-loader', exclude: /node_modules/ },
        ],
    },

    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, '../../dist/client')
    },

    plugins: mode === 'development' ? [
        new HtmlWebpackPlugin({
            title: 'blockyboi (Development Build)',
            template: path.resolve(__dirname, 'index.ejs')
        }),
        new WebpackBundleAnalyzer()
    ] : [
        new HtmlWebpackPlugin({
            title: 'blockyboi',
            template: path.resolve(__dirname, 'index.ejs')
        }),
    ],

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /node_modules/,
                    name: 'vendor',
                    chunks: 'all'
                }
            }
        }
    }
}