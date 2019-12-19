
<template>
  <div id="container">
    <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
        <span>Peer connection SDP信息</span>
    </h1>
   <div> 
        <button id="startButton" @click="start">Start</button>
        <button id="callButton" @click="call">Call</button>
        <button id="hangupButton" @click="hangup">Hang Up</button>
        <button id="testIceRestart" @click="testIceRestart">create offer</button>
    </div>
    <div class="content">
      <div class="item">
        <h2>local:</h2>
        <video id="localVideo" playsinline autoplay muted width="340px" height="180px"></video>
        <h2>offer SDP:</h2>
        <textarea name="" id="offer" cols="50" rows="10" :value="offerSDP"></textarea>
      </div>
      <div class="item"> 
        <h2>remote:</h2>
        <video id="remoteVideo" playsinline autoplay width="340px" height="180px"></video>
        <h2>answer SDP:</h2>
        <textarea name="" id="answer" cols="50" rows="10" :value="answerSDP"></textarea>
      </div>
    </div>
  </div>
</template>
<script>
import { log } from "@/utils/logging";
export default {
  name: "VideoChat",
  components: {
  },
  data: () => ({
    // videos
    myVideo: {},
    remoteVideo: {},
    
    // Media config
    constraints: {
      audio: {
        noiseSuppression:true, 
        echoCancellation:true
      },
      video: {
        width:1920,
        height:1080,
        frameRate:30,
        facingMode:"environment"
      }
    },

    // local & remote video stream
    localStream: undefined,
    remoteStream: undefined,

    //offer & answer SDP
    offerSDP:'',
    answerSDP:'',
    //create offer option
    offerOptions:{}
  }),
  created() {
    this.offerOptions={
       offerToRecieveAudio:1,
       offerToRecieveVideo:1,
       iceRestart:false //iceRestart设置为true的话，当网络环境发生变化时会重新收集candidate,建立新的链路
                        //根据sdp信息中的ice-ufrag是否变化
     }
  },
  mounted() {
    this.myVideo = document.getElementById("localVideo");
    this.remoteVideo = document.getElementById("remoteVideo");
  },
  methods: {
    //拿到媒体流
    async getUserMedia() {
      log(`Requesting  video stream`);

      if ("mediaDevices" in navigator) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(this.constraints);
          this.myVideo.srcObject = stream;
          this.localStream = stream;
          log("Received local video stream");
        } catch (error) {
          log(`getUserMedia error: ${error}`);
        }
      }
    },
    async start(){
      await this.getUserMedia();
    },
    call(){
      var _this=this;
     //创建webrtc连接对象
     var pc1 = new RTCPeerConnection(); 
     var pc2 = new RTCPeerConnection(); 
     this.pc1=pc1;
     this.pc2=pc2;
     //接收到icecandidate后通知对方增加candidate（candidate的收集）
     pc1.onicecandidate = (e)=>{
        pc2.addIceCandidate(e.candidate);
     }
     pc2.onicecandidate = (e)=>{
        pc1.addIceCandidate(e.candidate);
     }
     //pc2作为被调用方，接收到轨道后,设置远程视频流地址
     pc2.ontrack = this.getRemoteStream;
     //将本地采集的数据添加到pc1的PeerConnection，这样在做媒体协商的时候就知道有哪些数据（必须先添加数据再做媒体协商）
     this.localStream.getTracks().forEach((track)=>{
       pc1.addTrack(track,this.localStream)
     })
     
     //本地创建offer,进行媒体协商流程
     pc1.createOffer(_this.offerOptions).then((desc)=>{
       //本地创建offer成功后，设置localDescription,对方设置remoteDescription,并且创建answer
        pc1.setLocalDescription(desc).then(()=>{ //触发pc1的onicecandidate
          console.log("pc1 setLocalDescription success")
        }).catch((err)=>{
          console.log(err)
        })
        _this.offerSDP=desc.sdp;
        //pc1 send desc to signal
        //pc2 receive desc from signal
        pc2.setRemoteDescription(desc).then(()=>{
          console.log("pc2 setRemoteDescription success")
        }).catch((err)=>{
          console.log(err)
        })
        //远程端创建answer成功后设置localDescription，并且让对方设置remoteDescription
        pc2.createAnswer().then((desc)=>{
          console.log("pc2 createAnswer success")
          pc2.setLocalDescription(desc).then(()=>{ //触发pc2的onicecandidate
            console.log("pc2 setLocalDescription success")
          }).catch((err)=>{
            console.log(err)
          })
          _this.answerSDP=desc.sdp;
          //pc2 send desc to signal
          //pc1 receive desc from signal
          pc1.setRemoteDescription(desc).then(()=>{
            console.log("pc1 setRemoteDescription success")
          }).catch((err)=>{
            console.log(err);
          })
        }).catch((err)=>{
          console.log(err);
          console.log("pc2创建answer失败"); 
        });
     }).catch((err)=>{
       console.log(err);
       console.log("pc1创建offer失败");
     });
    },
    testIceRestart(){
      this.offerOptions={
        offerToRecieveAudio:1,
        offerToRecieveVideo:1,
        iceRestart:true
      }
      this.call()
    },
    //获取远程流并且设置远程视频地址
    getRemoteStream(e){
      console.log('getRemoteStream', e.track, e.streams[0]);

      // reset srcObject to work around minor bugs in Chrome and Edge.
      this.remoteVideo.srcObject = null;
      this.remoteVideo.srcObject = e.streams[0];
    },
    hangup(){
      this.pc1.close();
      this.pc2.close();
      this.pc1=null;
      this.pc2=null;
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