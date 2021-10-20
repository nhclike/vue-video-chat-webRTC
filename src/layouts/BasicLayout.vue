/* 主框架 */
<template>
  <div>
    <div class="top">
      top
    </div>
    <div class="left">
      <ul>
        <li>
          <router-link to="peerConnection">peerConnection</router-link>
        </li>
        <li>
          <router-link to="peerConnectionSDP">peerConnectionSDP</router-link>
        </li>
        <li>
          <router-link to="oneToOne">oneToOne</router-link>
        </li>
        <li>
          <router-link to="controlBandWidth">controlBandWidth</router-link>
        </li>
        <li>
          <router-link to="getStats">getStats</router-link>
        </li>
        <li>
          <router-link to="createDataChannel">createDataChannel</router-link>
        </li>
        <li>
          <router-link to="peerConnection">peerConnection</router-link>
        </li>
      </ul>
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
export default {
  name: "BasicLayout",
  data() {
    return {};
  },
};
</script>
