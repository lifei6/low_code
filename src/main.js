import { createApp } from 'vue'
// 引入样式
import 'element-plus/dist/index.css'
import App from './App.vue'

// 引入仓库
import store from './store'

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
app.use(store)
app.mount('#app')
