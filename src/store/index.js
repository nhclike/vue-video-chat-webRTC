import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'
Vue.use(Vuex);

const debug = process.env.NODE_ENV != 'production'


export default new Vuex.Store({
    actions,
    getters,
    state,
    mutations,
    strict: debug, // 严格模式，是否能在mutation外修改state值，true → 不能修改，false → 可以修改
    plugins: debug ? [createLogger()] : []
})