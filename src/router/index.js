/* router总入口，导出所有路由,router从“斜杠”开始 */
import Vue from 'vue';
import VueRouter from 'vue-router';
import RouterConfig from './modules'; // 引入业务逻辑模块
import CommonRouters from './comm'; // 引入通用模块
Vue.use(VueRouter);
export default new VueRouter({
    mode: 'history',
    base: '/zxzh',
    routes: RouterConfig.concat(CommonRouters)
});