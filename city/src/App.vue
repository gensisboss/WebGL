<script setup>
import { onMounted } from 'vue';
import { initCity } from './enter'
onMounted(hook ,()=>{
  //初始化三维场景
  initCity();
})
</script>

<template>
  <canvas id="webgl">浏览器不支持webgl，请更换浏览器</canvas>
</template>

<style scoped>

</style>
