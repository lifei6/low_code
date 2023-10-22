import { defineStore } from "pinia";

const useSystemStore = defineStore('system', {
    state: () => ({
        // 收集自定义表单数据
        formData: {
            username: "baomaoxianren",
            password: "faaf23afaf",
            start: 0,
            end: 100,
        },
        // 加个字段判断是否为预览模式(编辑页面里面组件有无遮罩层)
        preview: false,
        // 加个字段判断进入预览页面
        editor: true,

        // TODO:兼容两种布局模式
        // 原生拖拽和vuedraggable拖拽切换字段
        vuedrag: true
    }),
    actions: {
        // 切换能填写数字
        switchPreview() {
            this.preview = !this.preview
        },
        // 切换到预览页面
        switchEditor(newValue) {
            this.editor = newValue
        },
        // TODO:将来进行两种拖拽模式切换
        switchVuedrag() {
            this.vuedrag = !this.vuedrag
        },
    }

})

export default useSystemStore