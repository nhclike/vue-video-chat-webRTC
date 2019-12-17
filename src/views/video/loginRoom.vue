/* loginRoom */
<template>
  <div>
    <span>loginRoom</span>
    <br>
    <span>用户名</span>
    <input type="text" v-model="uName">
    <span>房间号</span>
    <input type="Number" v-model="roomNum">
    <button type="button" @click="joinRoom">进入chat聊天室</button>
  </div>
</template>
<script>
export default {
    name: 'home',
    data() {
        return {
          uName:'',
          roomNum:0

        };
    },
    methods:{
      joinRoom(){
        this.$router.push({
          path:'/main/video/chat',
          query:{
            uName:this.uName,
            roomNum:this.roomNum
          }
        })
      }
    }
};
</script>

