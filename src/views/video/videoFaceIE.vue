<template>
  <div class="video">
    <h2>基本api测试</h2>
    <div class="video__partner">
       <div>
        <label>audio Source</label>
        <select id="audioSource">
          <option :value="item.value" v-for="(item,index) in audioSourceOption" :key="index">{{item.text}}</option>
        </select>
      </div>
      <div>
        <label>audio output device</label>
        <select id="audioOutput">
          <option :value="item.value" v-for="(item,index) in audioOutputOption" :key="index">{{item.text}}</option>
        </select>
      </div>
      <!-- <div>
        <label>audio input device</label>
        <select id="audioInput">
          
        </select>
      </div> -->
      <div>
        <label>video Source</label>
        <select id="videoSource">
          <option :value="item.value" v-for="(item,index) in videoSourceOption" :key="index">{{item.text}}</option>
        </select>
      </div>
      <!-- <div>
        <label>video input device</label>
        <select id="videoInput">
          
        </select>
      </div> -->
      
      <!-- <div>
        <label>Filter</label>
        <select id="filter">
          <option value="none">None</option>
          <option value="blur">blur</option>
          <option value="grayscale">grayscale</option>
          <option value="invert">invert</option>
          <option value="sepia">sepia</option>
        </select>
      </div> -->
      <table>
        <tr>
          <td>
            <video id="localVideo" class="video__myself" autoplay controls width="340px" height="180px"></video>
          </td>
          <td>
            <video id="recordLocalVideo" class="video__myself" ref="recordLocalVideo"  controls width="340px" height="180px"></video>
          </td>
          <td>
            <div id="constraints" class="output">
              <span>视频约束</span>
              <pre>
                {{videoConstraints}}
              </pre>
              
            </div>
          </td>
        </tr>
        <tr>
          <td>
            <button id="startRecord" @click="recordClick" ref="startRecord">{{recordBtnText}}</button>
          </td>
          <td>
            <button id="recordPlay" :disabled="recordPlayFlag" @click="recordPlay">record Play</button>
          </td>
          <td>
            <button id="download" :disabled="downloadRecordFlag" @click="downloadRecord">download</button>
          </td>
        </tr>
        <tr>
          <td>
            <button id="snapshot" @click="snapshot">Take snapshout</button>
            <canvas id="picture" ref="picture"></canvas>
          </td>
          <td>
            <button id="startLocalMedia" @click="startLocalMedia">start local media</button>
          </td>
          <td>
            <button id="startCapture" @click="startCapture">start capture</button>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>
<script>
import '../../../public/adapter.screenshare.js';
import { log } from "@/utils/logging";
export default {
  name: "VideoChat",
  components: {
  },
  data: () => ({
    // videos
    myVideo: {},

    //source
    audioSourceOption:[],
    audioOutputOption:[],
    videoSourceOption:[],

    //Constraints(媒体约束)
    videoConstraints:'',

    //record
    recordBtnText:'start record',
    recordPlayFlag:false,
    downloadRecordFlag:false,

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

    // local video stream
    localStream: undefined
  }),
  async created() {
    await this.getUserMedia();
    await this.getDevices();
    await this.getAudioVideo();
  },
  mounted() {
    this.myVideo = document.getElementById("localVideo");
  },
  methods: {
    //拉起本地音视频流
    async startLocalMedia(){
      await this.getUserMedia();
      await this.getAudioVideo();
    },
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
    //拿到音视频轨道
    getAudioVideo() {
      let videoTrack = this.localStream.getVideoTracks()[0];
      let audioTrack = this.localStream.getAudioTracks();
      console.log(videoTrack);
      console.log(audioTrack);

      let videoConstraintsData=videoTrack.getSettings();
      console.log(videoConstraintsData)
      this.videoConstraints=JSON.stringify(videoConstraintsData,null,4)
     console.log(this.videoConstraints)
    },
    //获取设备信息
    getDevices(){
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.log('不支持获取设备信息！');
      }else{
      navigator.mediaDevices.enumerateDevices()
            .then(this.showDevice)
            .catch((err)=>{
              console.log(err.name+":"+err.message);
            });
      }
    },
    //进行屏幕共享
    async  startCapture() {
       await this.getDisplayMedia();
       await this.getAudioVideo();
    },
    //获取屏幕流
    async getDisplayMedia(){
      //打开chrome中
      //chrome://flags/#enable-experimental-web-platform-features
      //getDisplayMedia无法同时采集音频
      let captureStream = null;

      try {
        captureStream = await navigator.mediaDevices.getDisplayMedia(this.constraints);
        this.myVideo.srcObject = captureStream;
        this.localStream = captureStream;
      } catch(err) {
        console.error("Error: " + err);
      }
      return captureStream;
    },
    //展示设备信息
    showDevice(deviceInfos){
      let _this=this;
      deviceInfos.forEach(function(deviceinfo){
        var option={
          text:deviceinfo.label,
          value:deviceinfo.deviceId
        }
        //console.log(deviceinfo);
        if(deviceinfo.kind === "audioinput"){
          _this.audioSourceOption.push(option);
        }else if(deviceinfo.kind === "audiooutput"){
          _this.audioOutputOption.push(option);
        }else if(deviceinfo.kind === "videoinput"){
          _this.videoSourceOption.push(option);
        }
      })
    },
    //截图
    snapshot(){
      let canvas=this.$refs.picture;
      canvas.width=400;
      canvas.height=300;
      canvas.getContext("2d").drawImage(this.myVideo,0,0,canvas.width,canvas.height);
    },
    //录制按钮点击事件
    recordClick(){
      if(this.recordBtnText === "start record"){
        this.startRecord();
        this.recordPlayFlag=true;
        this.downloadRecordFlag=true;
        this.recordBtnText="stop record";
      }
      else{
        this.stopRecord();
        this.recordPlayFlag=false;
        this.downloadRecordFlag=false;
        this.recordBtnText="start record"
      }
    },
    //开始录制本地视频
    startRecord(){
      let _this=this;
      this.buffer=[];
      let options={
        mimeType:'video/webm;codecs=vp8'
      }
      if(!MediaRecorder.isTypeSupported(options.mimeType)){
        console.error(`${options.mimeType}is not supported!`);
        return
      }
      try {
        this.mediaRecorder=new MediaRecorder(this.localStream,options);
      } catch (error) {
        console.log("Failed to create MediaRecorder:",error);
        return ;
      }
      this.mediaRecorder.ondataavailable=function (e) {
        console.log("ondataavailable")
        console.log(e.data)
        if(e && e.data && e.data.size>0){
          _this.buffer.push(e.data);
        }
      };
      this.mediaRecorder.start();
    },
    //停止录制本地视频
    stopRecord(){
      this.mediaRecorder.stop();
    },
    //记录播放
    recordPlay(){
      var blob=new Blob(this.buffer,{type:'video/webm'});
      this.$refs.recordLocalVideo.src=window.URL.createObjectURL(blob);
      this.$refs.recordLocalVideo.srcObject=null;
      this.$refs.recordLocalVideo.play();
    },
    //下载录制的视频
    downloadRecord(){
      var blob=new Blob(this.buffer,{type:'video/webm'});
      var url=window.URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;
      a.style.display="none";
      a.download="aaa.webm";
      a.click();
    }
  },
  watch: {
    
  }
};
</script>
