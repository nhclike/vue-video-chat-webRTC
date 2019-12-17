
<template>
  <div id="container">
   
   <div> 
       <button id="connServer" :disabled="connectFlag" @click="connServer">Connect Sig Server</button>
       <button id="leave" :disabled="leaveFlag" @click="leave">leave</button>

    </div>
    <div class="content">
      <div class="item">
        <h2>local:</h2>
        <video id="localVideo" playsinline autoplay muted></video>
        
      </div>
      <div class="item"> 
        <h2>remote:</h2>
        <video id="remoteVideo" playsinline autoplay></video>
       
      </div>
    </div>
  </div>
</template>
<script>
/**
 * 1、消息通讯的连接建立要在音视频数据获取之后，否则会导致有可能绑定音视频流失败
 * 2、当一端退出房间后另外一端的PeerConnection要关闭重建，否则与新用户互通时媒体协商会失败
 * 3、异步事件处理
 * 
 * **/
import { log } from "@/utils/logging";
export default {
  name: "VideoChat",
  components: {
  },
  data: () => ({
    // videos
    localVideo: {},
    remoteVideo: {},
    
    // Media config
    constraints: {
      audio: {
        noiseSuppression:true, 
        echoCancellation:true
      },
      video: {
        width:340,
        height:180,
        frameRate:30,
        facingMode:"environment"
      }
    },

    // local & remote video stream
    localStream: undefined,
    remoteStream: undefined,

    connectFlag:false,
    leaveFlag:false,

    pc:null,
    state:"init",

    roomid:'111111'
  }),
  sockets:{
      //不能改,建立连接自动调用connect
      connect: function() {
        //与socket.io连接后回调
        console.log("socket connected");
      },
     
      joined:function (data) {
        console.log("joined",data)
        //加入成功后不能再次连接,可以离开
        this.connectFlag=true;
        this.leaveFlag=false;
        //改变状态
        this.state="joined";
        //创建了一个连接，并且将本地获取的音视频数据绑定到连接上，做好媒体协商的前提准备
        this.createPeerConnection();
        console.log("joined:state=",this.state)
      },
      otherjoin:function (data) {
        console.log("otherjoin",data)
        /**
         * 对应场景：a加入后b加入----a=>joined_conn,b=>joined
         *         a离开      ----a=>init,b=>joined_unbind
         *         c加入      ----b接受到otherjoin消息，此时b状态由joined_unbind=>joined_conn
         *                       由于之前的RTCPeerConnection已经关闭，需要重新创建RTCPeerConnection
         * **/
        if(this.state=="joined_unbind"){   
          this.createPeerConnection();
        }
        //改变状态
        this.state="joined_conn";//加入房间且可以音视频数据交互状态
        //媒体协商,主叫方开始创建offer
        this.call();

        console.log("otherjoin:state=",this.state)

      },
      full:function (data) {
        console.log("full:",data)
        this.state='leaved';
        //可以再次连接
        this.connectFlag=false;
        this.leaveFlag=true;
        console.log("full:state=",this.state);
        alert("rom is full");
        //this.$socket.disconnect();
      },
      leaved:function (data) {
        console.log("leaved:",data)
        //已经离开了，可以再次连接
        this.connectFlag=false;
        this.leaveFlag=true;
        this.state='leaved';
        
        console.log("leaved:state=",this.state);
        //真的已经离开后才关闭连接
        this.$socket.disconnect();
      },
      bye:function (data) {
        console.log("bye：",data)
        this.state="joined_unbind";
        this.closePeerConnection();
        console.log("bye:state=",this.state);
      },
      message:function (msg) {
        console.log("received message:",msg)
        var data=msg[1];
        if(data){
          if(data.type=="offer"){
            console.log("received offer!")
            this.pc.setRemoteDescription(new RTCSessionDescription(data));
            this.pc.createAnswer().then((desc)=>{
              console.log("createAnswer success!");
              this.pc.setLocalDescription(desc).then(()=>{
                console.log("setLocalDescription success!")
              }).catch((err)=>{
                console.log("Failed setLocalDescription",err);
              });
              this.sendMessage(this.roomid,desc);
            }).catch((err)=>{
              console.log("Failed to getAnswer");
              console.log(err);
            });
          }else if(data.type=="answer"){
            console.log("received answer!")
            this.pc.setRemoteDescription(new RTCSessionDescription(data));
          }else if(data.type=="candidate"){

            /**
             * 设置setLocalDescription之后可以收集candidate,
             * 每当收集candidate的时候，触发pc的onicecandidate事件，
             * 此事件触发后会sendMessage,通知对方收集candidate
             * **/
            var candidate=new RTCIceCandidate({
              sdpMLineIndex:data.label,
              sdpMid:data.id,
              candidate:data.candidate
            })
            console.log("received candidate!",candidate)

            this.pc.addIceCandidate(candidate);
          }else{
            console.log("the message is  invalid!",data);
          }
        }
      }
    },
  created() {
  },
  mounted() {
    this.localVideo = document.getElementById("localVideo");
    this.remoteVideo = document.getElementById("remoteVideo");
  },
  methods: {
    //拿到媒体流
    async getUserMedia() {
      log(`Requesting  video stream`);

      if ("mediaDevices" in navigator) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
          this.localVideo.srcObject = stream;
          this.localStream = stream;
          console.log("Received local video stream",this.localStream);
          //拿到本地媒体流后进行信令交互，创建peerConnection并进行媒体协商
          this.sendToService("join",this.roomid);
        } catch (error) {
          console.log(`getUserMedia error: ${error}`);
        }
      }
    },
    //创建offer发送给对方
    call(){
      if(this.state=="joined_conn"){  //只有呼叫方可以创建offer
        if(this.pc){
          var options={
            offerToReceiveAudio:1,
            offerToReceiveVideo:1
          }
          this.pc.createOffer(options).then((desc)=>{
            console.info("createOffer success!")
            this.pc.setLocalDescription(desc).then(()=>{
              console.log("setLocalDescription success!");
            }).catch((err)=>{
              console.log("setLocalDescription Failed!",err);
            });
            this.sendMessage(this.roomid,desc);
          }).catch((err)=>{
            console.log(err)
          })
        }
      }
    },
    sendMessage(roomid,data){
      if(this.$socket){
        this.$socket.emit("message",roomid,data);
      }
    },
    connServer(){
      this.getUserMedia();
      
    },
    sendToService(name,val) {
      this.$socket.emit(name,val);
    },
    leave(){
      if(this.$socket){
        this.sendToService("leave",this.roomid);
      }
      //关闭通道和本地媒体流
      this.closePeerConnection();
      this.closeLocalMedia();
    },
    createPeerConnection(){
      console.log("create RTCPeerConnection!");
      var _this=this;

      //创建webrtc连接对象
      if(!this.pc){
        // let pcConfig={
        //   'iceServers':[{
        //     'urls':'turn:stun.al.learningrtc.cn:3478',
        //     'credential':'mypasswd',
        //     'username':'garrylea'
        //   }]
        // }
      
        this.pc = new RTCPeerConnection();
        //做媒体协商时会触发此事件
        this.pc.onicecandidate=(e)=>{
          console.log("onicecandidate event is active",e)
          if(e.candidate){
            //接收到icecandidate后通知对方增加candidate（candidate的收集）
            console.log("find an new candidate",e.candidate);
            _this.sendMessage(_this.roomid,{
              type:'candidate',
              label:e.candidate.sdpMLineIndex,
              id:e.candidate.sdpMid,
              candidate:e.candidate.candidate
            })
          }
        }
        //打通通道，进行媒体协商结束后，接收到远方数据后触发，设置远程视频流地址
        this.pc.ontrack=(e)=>{
          console.log("ontrack event is active",e)

          if(e && e.streams[0]){
            _this.remoteVideo.srcObject = null;
            _this.remoteVideo.srcObject = e.streams[0];
          } 
        }
        //旧版api现在用ontrack代替
        // this.pc.onaddstream=(e)=>{
        //   console.log("onaddstream event is active",e)

        //   if(e && e.streams){
        //     _this.remoteVideo.srcObject = null;
        //     _this.remoteVideo.srcObject = e.streams;
        //   }
        // }
      }
      //将本地采集的数据添加到PeerConnection，这样在做媒体协商的时候就知道有哪些数据（必须先添加数据再做媒体协商）
      if(this.localStream){
        console.log("")
        this.localStream.getTracks().forEach((track)=>{
          _this.pc.addTrack(track,this.localStream);
        })
        //旧版api现在用addTrack代替
        //_this.pc.addStream(this.localStream);
      }
    },
    closePeerConnection(){
      console.log("close RTCPeerConnection");
      if(this.pc){
        this.pc.close();
        this.pc=null;
      }
    },
    closeLocalMedia(){
      if(this.localStream && this.localStream.getTracks()){
        this.localStream.getTracks().forEach((track)=>{
          track.stop();
        })
      }
      this.localStream=null;
    }
    
  }
};
</script>

<style lang="less" scoped>
.content{
  width: 900px;
  height: 500px;
}
.item{
  float: left;
  height: 500px;
  width: 400px;
}
</style>