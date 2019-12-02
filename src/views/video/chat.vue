/* chat */
<template>
  <div>
    <div>chat</div>
    <br>
    <span>用户名</span>
    <input type="text" v-model="uName">
    <br>
    <input type="text" v-model="msg" @keydown.enter="sendMsg()">
    <button type="button" @click="sendMsg()">发送消息</button>
    <br>
    <input @change="fileSelect" type="file" ref="file">
    <button type="button" @click="submit">发送图片</button>
    <p>{{percentCompleted}}%</p>
    <div>
      <div v-for="(item,index) in showMsgs" :key="index">
        <p v-if="item.type=='text'">{{item.uName}}:{{item.msg}}</p>
        <p v-else>
          {{item.uName}}:
          <img :src="item.avatarUrl" alt="" width="40px" height="40px">

        </p>
      </div>
    </div>
  </div>
</template>
<script>
export default {
    name: 'chat',
    data() {
        return {
          msg:'',
          uName:'',
          showMsgs:[],
          file:'',
          percentCompleted:0,
          avatarUrl:''
        };
    },
    sockets:{
      //不能改,建立连接自动调用connect
      connect: function() {
        //与socket.io连接后回调
        console.log("socket connected");
      },
      //服务端向客户端发送login事件
      login: function(data) {
        //监听login(后端向前端emit  login的回调)
        console.log("服务端向客户端发送login事件");
        console.log(data)
      },
      //接收服务端返回的消息
      message:function(data){
        console.log("接收服务端返回的消息");
        console.log(data);
        this.showMsgs.push(data);
      },
      //接收服务端返回的图片
      photoUpload:function (data) {
        console.log("接收服务端返回的消息");
        console.log(data);
        this.showMsgs.push(data);
      }
    },
    methods:{
      sendToService(name,val) {
        this.$socket.emit(name,val);
      },
      sendMsg(){
        let msgObj={
          type:'text',
          uName:this.uName,
          msg:this.msg
        }
        this.sendToService('message',msgObj)
      },
      sendPic(){
        let msgObj={
          type:'image',
          uName:this.uName,
          avatarUrl:this.avatarUrl
        }
        this.sendToService('photoUpload',msgObj)
      },
      async submit(){
        const formData = new FormData();
        formData.append('file',this.file);
        await axios.post('http://127.0.0.1:3000/upload',formData,{
          onUploadProgress:(progressEvent)=>{
            var percentCompleted = Math.round( (progressEvent.loaded * 100) / progressEvent.total );
            this.percentCompleted = percentCompleted;
          }
        }).then((res)=>{
          console.log(res);
          this.avatarUrl=res.data.avatarUrl;
          this.sendPic();
        });
      },
      fileSelect(){
        let file = this.$refs.file.files[0];
        this.file = file;
        console.log(this.file);
      }
    }
};
</script>

