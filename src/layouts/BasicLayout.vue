/* 主框架 */
<template>
  <div>
    <div class="top">
      top
    </div>
    <div class="left">
      left
    </div>
    <div class="main">
      <router-view></router-view>
    </div>
  </div>
</template> 

<script>
export default {
    name: 'BasicLayout',
    data() {
        return {};
    }
};
</script>


