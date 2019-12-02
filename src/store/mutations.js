import * as types from './mutation-types'
const mutations = {
    /**
     * state:当前状态树
     * v: 提交matations时传的参数
     */
    [types.SET_USER_INFO](state, obj) {
        state.userInfo = Object.assign(state.userInfo, obj);
    },
};

export default mutations