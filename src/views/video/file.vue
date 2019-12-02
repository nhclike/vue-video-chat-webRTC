<template>
  <div>
    <form>
      <label>选择文件</label>
      <input @change="fileSelect" type="file" ref="file">
      <button type="button" @click="submit">上传</button>
    </form>
    <div class="progress-wrap">
      <p>上传进度</p>
      <p class="progress"><span :style="style"></span></p>
    </div>
    <div>
      <img :src="avatarUrl" alt="" width="400px" height="400px">
    </div>
  </div>
</template>

<script>
export default {
  name: 'file',
  data(){
    return{
      file:'',
      percentCompleted:0,
      avatarUrl:''
    }
  },
  computed: {
    style(){
      return {
        width:this.percentCompleted+'%'
      }
    }
  },
  methods: {
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
      });
    },
    fileSelect(){
      let file = this.$refs.file.files[0];
      this.file = file;
      console.log(this.file);
    }
  },
}
</script>

<style lang="less">
.progress-wrap{
  width: 300px;
  p{
    width: 100%;
  }
  .progress{
    background-color: #c5c8ce;
    height: 20px;
    span{
      display: block;
      background-color: #19be6b;
      height: 100%;
      width: 0;
    }
  }
}

</style>