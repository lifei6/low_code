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
        // 加个字段判断是否为预览模式
        preview: false,
        // 加个字段判断是否只留内容区
        editor: true,

        // TODO:兼容两种布局模式
        // 原生拖拽和vuedraggable拖拽切换字段
        vuedrag: true
    }),
    actions: {
        switchPreview(newValue) {
            console.log('模式切换了')
            this.preview = newValue
        },
        switchEditor(newValue) {
            this.editor = newValue
        },
        switchVuedrag() {
            this.vuedrag = !this.vuedrag
        },
    }

})

export default useSystemStore