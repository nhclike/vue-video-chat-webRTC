/* 主页-路由配置 */
export default [

    { // 默认
        path: '/',
        redirect: '/login'
    },

    { // 管理员首页
        path: '/main',
        redirect: '/main/home'
    }
];