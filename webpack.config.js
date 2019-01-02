'use strict';

const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {

    context: __dirname + '/src/',

    entry: {
        'phaser-plugin-dvr' : './main.js',
        'phaser-plugin-dvr.min': './main.js'
    },

    output: {
        path: __dirname + '/dist/',
        filename: '[name].js',
        library: 'PhaserPluginDVR',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    
    plugins: [

        new UglifyJSPlugin({
            include: /\.min\.js$/,
            parallel: true,
            sourceMap: false,
            uglifyOptions: {
                compress: true,
                ie8: false,
                ecma: 5,
                output: {
                    comments: false
                },
                warnings: false
            },
            warningsFilter: (src) => false
        })

    ]

};
