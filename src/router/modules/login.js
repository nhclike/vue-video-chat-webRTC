/* 登录页路由配置 */

// 登录路由
const Login = () =>
    import ( /* webpackChunkName: "Login" */ '@/views/login/Login');
// 登录
const Entry = () =>
    import ( /* webpackChunkName: "Entry" */ '@/views/login/Entry');
// 注册
const Register = () =>
    import ( /* webpackChunkName: "Register" */ '@/views/login/Register');


export default [{ // 登录页
    path: '/login',
    component: Login,
    redirect: 'login/entry',
    children: [

        { // 登录
            path: 'entry',
            name: 'entry',
            component: Entry
        },

        { // 注册
            path: 'register',
            name: 'register',
            component: Register
        }
    ]
}];