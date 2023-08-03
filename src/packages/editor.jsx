import { computed, defineComponent, inject, ref } from "vue"

// 引入样式
import './editor.scss'

import EditorBlock from './editor-block'

// 引入自定义功能
import { useMenvDragger } from './useMenvDragger'
import deepcopy from "deepcopy"
import { useFocus } from "./useFocus"
import { useBlockDragger } from "./useBlockDragger"
import { useCommand } from "./useCommand"
import { $dialog } from "@/components/Dialog"
import { ElButton } from "element-plus"


export default defineComponent({
    props: {
        modelValue: { type: Object }
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        const data = computed({
            get: () => {
                return props.modelValue
            },
            set: (newVal) => {
                // console.log('设置newValue',newVal)
                ctx.emit('update:modelValue', deepcopy(newVal))
            }
        })
        // 加个字段判断是否为预览模式
        let previewRef = ref(false)
        // 加个字段判断是否只留内容区
        let editorRef = ref(true)

        // console.log(data.value)

        // 计算画布样式
        const containerStyle = computed(() => ({
            width: data.value.container.width + 'px',
            height: data.value.container.height + 'px',
        }))

        // 获取组件映射配置
        const config = inject('config')

        // 1.菜单拖拽
        // 获取目标元素
        const containerRef = ref(null)
        const { dragstart, dragend } = useMenvDragger(containerRef, data)

        // 2.获取焦点,选中后就可能进行拖拽
        let { blockMousedown, clearAllFocus, focusData, lastSelectBlock } = useFocus(data, previewRef, (e) => {
            mousedown(e)
        })


        // 3.多个元素拖拽和辅助线
        let { mousedown, markLines } = useBlockDragger(focusData, lastSelectBlock, data)


        // 4.菜单按钮
        // 实现菜单功能
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
                            commands.update(JSON.parse(text))
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
                <ElButton type="primary" onClick={e=> editorRef.value = true}>点击返回编辑</ElButton>
            </div>
        )

    }
})