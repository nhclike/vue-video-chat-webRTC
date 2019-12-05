import Vue from 'vue'
import App from './App.vue'
import store from './store/index'
import router from './router/index';
import VueSocketIO from 'vue-socket.io'
// Socket config
Vue.use(new VueSocketIO({
    debug: true,
    connection: "https://172.19.82.219:3000",
    vuex: {
        store,
        actionPrefix: 'SOCKET_',
        mutationPrefix: 'SOCKET_'
    },
}))
Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app')