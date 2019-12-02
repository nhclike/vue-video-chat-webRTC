const webpack = require('webpack');
const path = require('path');

function resolve(dir) {
    return path.join(__dirname, dir);
}
/* module.exports = {
  entry: ["@babel/polyfill", "./app/js"],
}; */
module.exports = {
    pluginOptions: {
        // 避免使用变量时每次都要引入
        'style-resources-loader': {
            preProcessor: 'less',
            patterns: [
                // 这个是加上自己的路径
                // 注意：试过不能使用别名路径
                path.resolve(__dirname, './src/style/params.less')
            ]
        }
    },
    // eslint-loader 是否在保存的时候检查
    lintOnSave: false,
    // 生产环境是否生成 sourceMap 文件，一般情况不建议打开
    productionSourceMap: false,
    configureWebpack: config => {
        // 配置文件路径
        Object.assign(config, {
            resolve: {
                extensions: ['.js', '.vue', '.json', '.css', '.scss', '.less'],
                alias: {
                    'vue$': 'vue/dist/vue.esm.js',
                    '@': resolve('src'),
                    '@@': resolve('src/views'),
                    'styles': resolve('src/styles'),
                    'components': resolve('src/components')
                }
            }
        });
        let pluginsWebpack = [
            // 使用ProvidePlugin加载的模块，需要在eslintrc.js的globals里设置
            new webpack.ProvidePlugin({
                axios: 'axios'
            })
        ];
        if (process.env.NODE_ENV === 'production') {
            // 为生产环境修改配置...
            // 使用DefinePlugin暴露的全局变量，需要在eslintrc.js的globals里设置
            pluginsWebpack.push(
                new webpack.DefinePlugin({
                    '__PROJECTPATH__': JSON.stringify(''),
                    '__GATEWAYPATH__': JSON.stringify('')
                })

            );
        } else {
            // 为开发环境修改配置...
            pluginsWebpack.push(
                new webpack.DefinePlugin({
                    '__PROJECTPATH__': JSON.stringify(''),
                    '__GATEWAYPATH__': JSON.stringify('/gateway'),

                })
            );
        }
        config.plugins = [...config.plugins, ...pluginsWebpack];
    },
    devServer: {
        host: "0.0.0.0",
        port: 8000, // 端口号
        https: false, // https:{type:Boolean}
        open: true, //配置自动启动浏览器  http://XXX.XXX.X.XX:7071/rest/XXX/ 
        hotOnly: true, // 热更新
        proxy: 'http://localhost:8000' // 配置跨域处理,只有一个代理

    }
};