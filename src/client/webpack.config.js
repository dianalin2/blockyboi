const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const mode = process.env.NODE_ENV || 'development';

module.exports = {
    entry: './src/client/index.ts',
    mode: mode,
    devtool: mode === 'development' ? 'inline-source-map' : false,

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
        filename: 'bundle.js',
        path: path.resolve(__dirname, '../../dist/client')
    },

    plugins: [
        new HtmlWebpackPlugin({
            title: 'blockyboi',
            template: path.resolve(__dirname, 'index.ejs')
        })
    ],
}