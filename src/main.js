import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import router from './router/index';
import VueSocketIO from 'vue-socket.io'
import '@babel/polyfill';// 兼容ie

// Socket config
Vue.use(new VueSocketIO({
    debug: true, //true则控制台可以看到socket连接和事件监听的一些信息
    connection: "http://172.19.82.225:3000",
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
    options: {
        path: '', //websocket连接地址的后缀默认/socket.io  
        autoConnect: false //默认自动连接，设置为false后自己控制connect
    }
}))
Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')