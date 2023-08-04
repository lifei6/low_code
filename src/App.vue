<template>
  <div class="app">
    <Editor v-model="state" :formData="formData"></Editor>
  </div>
</template>

<script>
import { provide, ref } from 'vue'
// 导入组件
import Editor from './packages/editor'

// 导入数据源
import data from './data.json'

// 引入定义好的组件配置器（和路由器差不多）
import {registerConfig} from './utils/editor-config'

export default {
  name: 'App',
  components: {
    Editor
  },
  setup(){
    let state = ref(data)
    // console.log(registerConfig)
    provide('config',registerConfig)

    // 造一些假的输入框数据
    const formData = ref({
      username:'baomaoxianren',
      password:"faaf23afaf",
      start:0,
      end:100,
    })

    //范围数据
    // const rangeDate = ref({
    //   start:
    // })
    return {
      state,
      formData,
    }
  }
}
</script>

<style lang="scss">
  .app {
    width: 100vw;  /* 100% of viewport width */
    height: 100vh; /* 100% of viewport height */
    position: relative;
  }
</style>
