import { computed, defineComponent, inject, ref } from "vue"

// 引入第三方库
import deepcopy from "deepcopy"
import { ElButton } from "element-plus"

// 引入样式
import './editor.scss'

// 引入子组件
import EditorBlock from './editor-block'
import { $dialog } from "@/components/Dialog"
import { $contextMenu } from "@/components/ContextMenu"
import { ContextItem } from "@/components/ContextItem"

// 引入自定义功能Compostion API
import { useMenvDragger } from './useMenvDragger'
import { useFocus } from "./useFocus"
import { useBlockDragger } from "./useBlockDragger"
import { useCommand } from "./useCommand"


export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        // 全局响应式数据---------更新data更新整个页面
        const data = computed({
            get: () => {
                return props.modelValue
            },
            set: (newVal) => {
                // console.log('设置newValue',newVal)
                ctx.emit('update:modelValue', deepcopy(newVal))
            }
        })
        // ---------菜单栏字段
        // 加个字段判断是否为预览模式
        let previewRef = ref(false)
        // 加个字段判断是否只留内容区
        let editorRef = ref(true)

        // 获取组件映射配置------------注入组件映射关系
        const config = inject('config')

        // 计算画布样式-----------------容器样式
        const containerStyle = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px',
        }))



        // -------------------------功能封装
        // 1.菜单拖拽
        // 获取目标元素-------为了判断拖拽元素与目标元素的位置关系：刚进入，在上面移动，出目标元素
        const containerRef = ref(null)
        const { dragstart, dragend } = useMenvDragger(containerRef, data)

        // 2.获取焦点,选中后就可能进行拖拽
        let { blockMousedown, clearAllFocus, focusData, lastSelectBlock } = useFocus(data, previewRef, (e) => {
            mousedown(e)
        })


        // 3.多个元素拖拽和辅助线
        let { mousedown, markLines } = useBlockDragger(focusData, lastSelectBlock, data)


        // 4.菜单按钮
        // 指令的名称和对应回调的映射
        const { commands } = useCommand(data, focusData)
        const buttons = [
            { label: '撤销', icon: 'icon-shangyibu', handler: commands.undo },
            { label: '重做', icon: 'icon-xiayibu', handler: commands.redo },
            {
                label: '导入', icon: 'icon-daoru', handler: () => {
                    // 弹出一个对话框
                    $dialog({
                        title: 'JSON数据导入',
                        content: '',
                        footer: true,//是否显示底部确认，取消按钮
                        onComfirm(text) {
                            commands.updateContainer(JSON.parse(text))
                            // data.value = JSON.parse(text)//刷新后导入无法保留历史记录
                        },//确认按钮的回调
                    })
                }
            },
            {
                label: '导出', icon: 'icon-daochu1', handler: () => {
                    // 弹出一个对话框
                    $dialog({
                        title: 'JSON数据导出',
                        content: JSON.stringify(data.value),
                        footer: false,//是否显示底部确认，取消按钮
                    })
                }
            },
            { label: '置顶', icon: 'icon-top1', handler: commands.top },
            { label: '置底', icon: 'icon-bottom', handler: commands.bottom },
            { label: '删除', icon: 'icon-shanchu', handler: commands.deleteElement },
            {
                label: () => previewRef.value ? '预览' : '编辑', icon: 'icon-yulan', handler: () => {
                    // 点击能切换预览模式
                    previewRef.value = !previewRef.value
                    clearAllFocus()
                    // 如果当前是预览模式则去除遮罩
                }
            },
            {
                label: '关闭', icon: 'icon-guanbi1', handler: () => {
                    editorRef.value = false
                }
            },


        ]


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
                                onComfirm:(text)=>{
                                    // 更新代码块传入旧代码块和新代码块
                                    commands.updateBlock(block,JSON.parse(text))
                                }
                            })
                        }}></ContextItem>
                    </>
                },
            })

        }


        // 预览和编辑模式渲染的DOM
        return () => editorRef.value ? (
            <div class="editor">
                <div class="editor-left">
                    {config.componentList.map((component) => {
                        return (
                            <div
                                class="editor-left-item"
                                //开启拖拽绑定回调
                                draggable
                                ondragstart={e => dragstart(e, component)}
                                ondragend={e => dragend(e)}
                            >
                                <span>{component.label}</span>
                                <div>{component.preview()}</div>
                            </div>
                        )
                    })}

                </div>
                <div class="editor-top">
                    {
                        buttons.map((btn, idx) => {
                            let label = typeof btn.label === 'function' ? btn.label() : btn.label
                            return <div class='editor-top-button' onClick={e => btn.handler()}>
                                <div class={`iconfont ${btn.icon}`}></div>
                                <div class='btn-label'>{label}</div>
                            </div>
                        })
                    }
                </div>
                <div class="editor-right">右侧</div>
                <div class="editor-container">
                    {/* 产生滚动条 */}
                    <div class="editor-container-canvas">
                        {/* 具体内容 */}
                        <div
                            class="editor-container-canvas-content"
                            style={containerStyle.value}
                            ref={containerRef}
                            onMousedown={e => clearAllFocus()}
                        >
                            {
                                data.value.blocks.map((block, index) => (
                                    <EditorBlock
                                        class={[block.focus ? 'editor-block-focus' : '', previewRef.value ? 'editor-block-preview' : '']}
                                        block={block}
                                        onMousedown={e => blockMousedown(e, block, index)}
                                        // 元素右击菜单事件
                                        onContextmenu={e => blockContextmenu(e, block)}

                                    >
                                    </EditorBlock>
                                ))
                            }
                            {/* 纵线 */}
                            {markLines.x !== null && (<div class="mark-line-x" style={{ left: markLines.x + 'px' }}></div>)}
                            {/* 横线 */}
                            {markLines.y !== null && (<div class="mark-line-y" style={{ top: markLines.y + 'px' }}></div>)}

                        </div>

                    </div>
                </div>
            </div>
        ) : (
            <div>
                <div
                    class="editor-container-canvas-content"
                    style={containerStyle.value}
                >
                    {
                        data.value.blocks.map((block, index) => (
                            <EditorBlock
                                class={'editor-block-preview'}
                                block={block}
                            >
                            </EditorBlock>
                        ))
                    }
                </div>
                <ElButton type="primary" onClick={e => editorRef.value = true}>点击返回编辑</ElButton>
            </div>
        )

    }
})