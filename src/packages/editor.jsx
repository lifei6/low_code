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



import { computed, defineComponent, inject, provide, ref } from "vue"

// 引入第三方库
import { ElButton } from "element-plus"

// 引入样式
import './editor.scss'

// 引入子组件
import { $dialog } from "@/components/Dialog"
import { $contextMenu } from "@/components/ContextMenu"
import { ContextItem } from "@/components/ContextItem"

// 引入自定义功能Compostion API
import { useMenvDragger } from '@/hooks/useMenvDragger'
import { useFocus } from "@/hooks/useFocus"
import { useBlockDragger } from "@/hooks/useBlockDragger"

// 使用store
import useCommandsStore from "@/store/commands/commands"
import useSystemStore from "@/store/system/system"
// 四个区域
import EditorLeft from "./editor-left"
import EditorRight from './editor-right'
import EditorContainer from "./editor-container"
import EditorTop from "./editor-top"

export default defineComponent({
    setup() {
        // 全局响应式数据--------------更新组件列表更新整个页面
        const commandsStore = useCommandsStore()
        const systemStore = useSystemStore()

        // ----------------------------------------功能封装-------------------------------
        // 1.菜单（物料区的组件菜单）拖拽
        // 获取目标元素-------判断拖拽元素与目标元素的位置关系：刚进入，在上面移动，出目标元素
        const containerRef = ref(null)
        // const { dragstart, dragend } = useMenvDragger(containerRef, commandsStore)


        // 4.菜单按钮
        // 指令的名称和对应回调的映射
        // const buttons = [
        //     { label: '撤销', icon: 'icon-shangyibu', handler: commandsStore.undo },
        //     { label: '重做', icon: 'icon-xiayibu', handler: commandsStore.redo },
        //     {
        //         label: '导入', icon: 'icon-daoru', handler: () => {
        //             // 弹出一个对话框
        //             $dialog({
        //                 title: 'JSON数据导入',
        //                 content: '',
        //                 footer: true,//是否显示底部确认，取消按钮
        //                 onComfirm(text) {
        //                     commandsStore.updateContainer(JSON.parse(text))
        //                     // data.value = JSON.parse(text)//刷新后导入无法保留历史记录
        //                 },//确认按钮的回调
        //             })
        //         }
        //     },
        //     {
        //         label: '导出', icon: 'icon-daochu1', handler: () => {
        //             // 弹出一个对话框
        //             $dialog({
        //                 title: 'JSON数据导出',
        //                 content: JSON.stringify({ container: commandsStore.container, blocks: commandsStore.components }),
        //                 footer: false,//是否显示底部确认，取消按钮
        //             })
        //         }
        //     },
        //     { label: '置顶', icon: 'icon-top1', handler: commandsStore.top },
        //     { label: '置底', icon: 'icon-bottom', handler: commandsStore.bottom },
        //     { label: '删除', icon: 'icon-shanchu', handler: commandsStore.deleteComponent },
        //     {
        //         label: () => systemStore.preview ? '编辑' : '预览', icon: 'icon-yulan', handler: () => {
        //             // 点击能切换预览模式
        //             systemStore.switchPreviewRef(!previewRef)
        //             // console.log('最后一个选中元素',lastSelectBlock.value.key)
        //             commandsStore.clearAllFocus()
        //             // 如果当前是预览模式则去除遮罩
        //         }
        //     },
        //     {
        //         label: '关闭', icon: 'icon-guanbi1', handler: () => {
        //             systemStore.switchEditorRef(false)
        //         }
        //     },
        //     {
        //         label: '切换拖拽', icon: 'icon-shanchu', handler: () => {
        //             systemStore.switchVuedrag()
        //         }
        //     }

        // ]


        //5.实现右击每个代码块出现下拉内容菜单
        const blockContextmenu = (e, block) => {
            // 阻止默认的内容菜单弹窗
            e.preventDefault()
            console.log('出现内容菜单')
            $contextMenu({
                el: e.target,//当前元素的真实DOM，菜单栏相对于点击的组件元素进行挂载
                context: () => {
                    return <>
                        <ContextItem label="删除组件" icon='icon-shanchu' onClick={() => commands.deleteElement()}></ContextItem>
                        <ContextItem label="置顶组件" icon='icon-top1' onClick={() => commands.top()}></ContextItem>
                        <ContextItem label="置底组件" icon='icon-bottom' onClick={() => commands.bottom()}></ContextItem>
                        <ContextItem label="导出组件" icon='icon-daochu1' onClick={() => {
                            $dialog({
                                title: '组件导出JSON',
                                content: JSON.stringify(block),
                                footer: false,//是否显示底部确认，取消按钮
                            })
                        }}></ContextItem>
                        <ContextItem label="导入组件" icon='icon-daoru' onClick={() => {
                            $dialog({
                                title: '组件导入JSON',
                                content: '',
                                footer: true,//是否显示底部确认，取消按钮
                                // 确认按钮的回调
                                onComfirm: (text) => {
                                    // 更新代码块传入旧代码块和新代码块
                                    commands.updateBlock(block, JSON.parse(text))
                                }
                            })
                        }}></ContextItem>
                    </>
                },
            })

        }


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
            <div>
                <ElButton type="primary" onClick={e => systemStore.switchEditorRef(true)}>点击返回编辑</ElButton>
                <div>表单数据：<span>{JSON.stringify(systemStore.formData)}</span></div>
            </div>
        )

    }
})