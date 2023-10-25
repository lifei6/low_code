import { createApp } from 'vue'

// 引入样式
// 样式重置
import 'normalize.css'
// import 'element-plus/theme-chalk/el-message.css'
// 引入element-plus的全部样式
import 'element-plus/dist/index.css'
import '@/assets/css/index.scss'

import App from './App.vue'
// 路由和pinia
import router from './router'
import store from './store'

// elemnet图标注册为全局组件
import icons from './global/register-icons'

// 解决elemnet-plus中使用el-table的ResizeObserver loop limit exceeded问题
const debounce = (fn, delay) => {
  let timer = null;
  return function () {
    let context = this;
    let args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  }
}

const _ResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends _ResizeObserver {
  constructor(callback) {
    callback = debounce(callback, 16);
    super(callback);
  }
}



const app = createApp(App)
app.use(icons)
app.use(store)
app.use(router)
app.mount('#app')
