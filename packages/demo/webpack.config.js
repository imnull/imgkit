const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = options => {
    const { WEBPACK_SERVE } = options
    return {
        mode: WEBPACK_SERVE ? 'development' : 'production',
        entry: './src/index',
        output: {
            path: path.resolve(__dirname, '../../docs'),
            filename: 'main.js',
        },
        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    exclude: /node_modules/,
                    loader: 'esbuild-loader',
                    options: {
                        loader: 'tsx',
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'sass-loader'
                    ]
                },
            ]
        },

        // 插件配置
        plugins: [
            new HtmlWebpackPlugin({
                template: './template.html',
                filename: `index.html`,
                hash: true,
                title: 'IMGKIT DEMO',
            }),
            new CleanWebpackPlugin(),
            // new CopyWebpackPlugin({
            //     patterns: [
            //         { from: 'static' }
            //     ]
            // })
        ],

        // 解析选项
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
            alias: {
                '~': path.resolve('./src'),
            }
        },
        devServer: {
            port: 3602,
            // static: path.resolve('static'),
            hot: true,
            allowedHosts: 'all',
        },
    };
}