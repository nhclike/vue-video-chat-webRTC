
<template>
  <div class="video">
    <div class="video__partner">
      <video id="remoteVideo" class="video__spinner" autoplay></video>
    </div>
    <video id="localVideo" class="video__myself" autoplay width="400px" height="400px"></video>
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
      audio: true,
      video: true
    },

    // local & remote video stream
    localStream: undefined,
    remoteStream: undefined,

    
  }),
  async created() {
    await this.getUserMedia();
    await this.getAudioVideo();
  },
  mounted() {
    this.myVideo = document.getElementById("localVideo");
    this.remoteVideo = document.getElementById("remoteVideo");
    

  },
  methods: {
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
    getAudioVideo() {
      const video = this.localStream.getVideoTracks();
      const audio = this.localStream.getAudioTracks();

      if (video.length > 0) log(`Using video device: ${video[0].label}`);
      if (audio.length > 0) log(`Using audio device: ${audio[0].label}`);
    },
  },

  watch: {
    
  }
};
</script>

<style lang="less" scoped>
.video {
  position: relative;
  height: 100%;
  &__partner {
    height: 100%;
  }
  &__myself {
    position: absolute;
    top: 0;
    float: left;
    left: 0;
    width: 450px;
    height: 400px;
    z-index: 2;
  }
  &__spinner {
    width: 100% !important;
    height: 100% !important;
  }
}
</style>