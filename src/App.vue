<template>
  <div class="app">
    <el-config-provider :locale="zhCn">
      <router-view></router-view>
    </el-config-provider>
  </div>
</template>

<script>
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import { ElConfigProvider } from "element-plus";

import { provide } from "vue";
// 导入组件
// import Editor from "./packages/editor";

// 引入定义好的组件配置器（和路由器差不多）
import { registerConfig } from "./utils/editor-config";

export default {
  name: "App",
  // components: {
  //   Editor,
  // },
  setup() {
    provide("config", registerConfig);
  },
};
</script>

<style lang="scss">
.app {
  width: 100vw; /* 100% of viewport width */
  height: 100vh; /* 100% of viewport height */
  position: relative;
}
</style>
