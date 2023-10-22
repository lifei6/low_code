// 注册element图标
// 这些图片注册为全局组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

function registerIcon(app) {
  // 使用elemnet图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }
}

export default registerIcon
