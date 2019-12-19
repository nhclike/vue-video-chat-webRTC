
<template>
  <div id="container">
    <h1><a href="//webrtc.github.io/samples/" title="WebRTC samples homepage">WebRTC samples</a>
        <span>Peer connection</span></h1>

    <video id="localVideo" playsinline autoplay muted width="340px" height="180px"></video>
    <video id="remoteVideo" playsinline autoplay width="340px" height="180px"></video>

    <div> 
        <button id="startButton" @click="start">Start</button>
        <button id="callButton" @click="call">Call</button>
        <button id="hangupButton" @click="hangup">Hang Up</button>
    </div>

    <p>View the console to see logging. The <code>MediaStream</code> object <code>localStream</code>, and the <code>RTCPeerConnection</code>
        objects <code>pc1</code> and <code>pc2</code> are in global scope, so you can inspect them in the console as
        well.</p>

    <p>For more information about RTCPeerConnection, see <a href="http://www.html5rocks.com/en/tutorials/webrtc/basics/"
                                                            title="HTML5 Rocks article about WebRTC by Sam Dutton">Getting
        Started With WebRTC</a>.</p>


    <a href="https://github.com/webrtc/samples/tree/gh-pages/src/content/peerconnection/upgrade"
       title="View source for this page on GitHub" id="viewSource">View source on GitHub</a>
    <p>
      ice收集网络地址检测联通性---通过ice-ufrag和ice-pwd检测连接的合法性，保证链路连接的安全性
      
    </p>
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
    remoteStream: undefined
    
  }),
  created() {
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
     //创建webrtc连接对象
     var pc1 = new RTCPeerConnection(); 
     var pc2 = new RTCPeerConnection(); 
     this.pc1=pc1;
     this.pc2=pc2;
     //接收到icecandidate后通知对方增加candidate（candidate的收集）
     pc1.onicecandidate = (e)=>{
        console.log("pc1.onicecandidate",e);
        if(e.candidate){
          pc2.addIceCandidate(e.candidate);
        }
       
     }
     pc2.onicecandidate = (e)=>{
        console.log("pc2.onicecandidate",e);
        if(e.candidate){
          pc1.addIceCandidate(e.candidate);
        }
        
     }
     //pc2作为被调用方，接收到轨道后,设置远程视频流地址
     pc2.ontrack = this.getRemoteStream;
     //将本地采集的数据添加到pc1的PeerConnection，这样在做媒体协商的时候就知道有哪些数据（必须先添加数据再做媒体协商）
     this.localStream.getTracks().forEach((track)=>{
       pc1.addTrack(track,this.localStream)
     })

     var offerOptions={
       offerToRecieveAudio:1,
       offerToRecieveVideo:1
     }
     //本地创建offer,进行媒体协商流程
     pc1.createOffer(offerOptions).then((desc)=>{
       //本地创建offer成功后，设置localDescription,对方设置remoteDescription,并且创建answer
        pc1.setLocalDescription(desc).then(()=>{ //触发pc1的onicecandidate
          console.log("pc1 setLocalDescription success")
        }).catch((err)=>{
          console.log(err)
        })
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
  },

  watch: {
    
  }
};
</script>

<style lang="less" scoped>

</style>