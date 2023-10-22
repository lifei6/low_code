// 整个编辑区页面：包含四区
// 一个组件注册中心
// 1.预览区：核心是预览组件，或者说是组件封装 以及组件拖拽
// 2.菜单栏：核心是一个指令注册系统，用来保留具有历史记录的操作
// 3.渲染区：
//        - 封装组件的渲染
//        - 组件的聚焦
//        - 组件的拖拽
//        - 拖拽的辅助线和快速贴近
//        - 右击下拉菜单栏
//        - 能与data形成双绑
//        - 组件的大小拖拽
// 4.属性操作区：能根据组件注册时的prop和model渲染对应的视图，能与block实现双向绑定


import { defineComponent, ref } from "vue"

// 引入第三方库
import { ElButton } from "element-plus"

// 引入样式
import './editor.scss'

// 使用store
import useSystemStore from "@/packages/store/system/system"
// 四个区域
import EditorLeft from "./components/editor-left/editor-left"
import EditorRight from './components/editor-right/editor-right'
import EditorContainer from "./components/editor-container/editor-container"
import EditorTop from "./components/editor-top/editor-top"

export default defineComponent({
    setup() {
        // 全局响应式数据--------------更新组件列表更新整个页面
        const systemStore = useSystemStore()

        // ----------------------------------------功能封装-------------------------------
        // 1.菜单（物料区的组件菜单）拖拽
        // 获取目标元素-------判断拖拽元素与目标元素的位置关系：刚进入，在上面移动，出目标元素
        const containerRef = ref(null)


        // // 6.编辑属性 应用属性
        // const updateContainerProps = (newProps) => {
        //     commands.updateContainer({ ...data.value, "container": newProps })
        // }
        // const updateBlockProps = (newProps) => {
        //     // newProps = newblock
        //     commands.updateBlock(lastSelectBlock.value, newProps)
        // }

        // // 7.大小拖拽
        // // 这里提供出去给修改大小后代触发历史记录(这里是通过索引更新的形式)
        // const updateBlockPropsByIndex = (oddBlock, newBlock) => {
        //     commands.updateBlock(oddBlock, newBlock, selectIndex.value)
        // }
        // provide('updateBlockPropsByIndex', updateBlockPropsByIndex)

        // 预览和编辑模式渲染的DOM
        return () => systemStore.editor ? (
            <div class="editor">
                <div class='editor-left'>
                    <EditorLeft containerRef={containerRef}></EditorLeft>
                </div>
                <div class="editor-top">
                    <EditorTop></EditorTop>
                </div>
                <div class="editor-right">
                    <EditorRight></EditorRight>
                </div>
                <div class="editor-container">
                    <EditorContainer containerRef={containerRef}></EditorContainer>
                </div>
            </div>
        ) : (
            <div class='preview'>
                <ElButton type="primary" onClick={e => systemStore.switchEditor(true)}>点击返回编辑</ElButton>
                <div>表单数据：<span>{JSON.stringify(systemStore.formData)}</span></div>
            </div>
        )

    }
})