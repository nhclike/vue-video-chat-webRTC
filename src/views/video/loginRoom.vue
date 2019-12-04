/* loginRoom */
<template>
  <div>
    <span>loginRoom</span>
    <br>
    <span>用户名</span>
    <input type="text" v-model="uName">
    <button type="button" @click="joinRoom">进入聊天室</button>
  </div>
</template>
<script>
export default {
    name: 'home',
    data() {
        return {
          uName:''

        };
    },
    methods:{
      joinRoom(){
        this.$router.push({
          path:'/main/video/chat',
          query:{
            uName:this.uName
          }
        })
      }
    }
};
</script>

