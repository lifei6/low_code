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
import deepcopy from "deepcopy"
import { ElButton } from "element-plus"

// 引入样式
import './editor.scss'

// 引入子组件
import EditorBlock from './editor-block'
import EditorOperator from './editor-operator'
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
        modelValue: { type: Object },
        formData:{type:Object}
    },
    emits: ['update:modelValue'],
    setup(props, ctx) {
        // 全局响应式数据--------------更新data==更新整个页面
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




        // ----------------------------------------功能封装-------------------------------
        // 1.菜单（物料区的组件菜单）拖拽
        // 获取目标元素-------为了判断拖拽元素与目标元素的位置关系：刚进入，在上面移动，出目标元素
        const containerRef = ref(null)
        const { dragstart, dragend } = useMenvDragger(containerRef, data)

        
        // 2.获取焦点,选中后就可能进行拖拽
        let { blockMousedown, clearAllFocus, focusData, lastSelectBlock,selectIndex } = useFocus(data, previewRef, (e) => {
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
                label: () => previewRef.value ? '编辑' : '预览', icon: 'icon-yulan', handler: () => {
                    // 点击能切换预览模式
                    previewRef.value = !previewRef.value
                    // console.log('最后一个选中元素',lastSelectBlock.value.key)
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


        // 6.编辑属性 应用属性
        const updateContainerProps = (newProps)=>{
            commands.updateContainer({...data.value,"container":newProps})
        }
        const updateBlockProps = (newProps)=>{
            // newProps = newblock
            commands.updateBlock(lastSelectBlock.value,newProps)
        }

        // 7.大小拖拽
        // 这里提供出去给修改大小后代触发历史记录(这里是通过索引更新的形式)
        const updateBlockPropsByIndex = (oddBlock,newBlock)=>{
            commands.updateBlock(oddBlock,newBlock,selectIndex.value)
        }
        provide('updateBlockPropsByIndex',updateBlockPropsByIndex)

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
                <div class="editor-right">
                    <EditorOperator 
                     block={lastSelectBlock.value} 
                     data={data.value}
                     updateContainerProps = {updateContainerProps}
                     updateBlockProps = {updateBlockProps}
                    ></EditorOperator>
                </div>
                <div class="editor-container">
                    {/* 产生滚动条 */}
                    <div class="editor-container-canvas">
                        {/* 具体内容 */}
                        <div
                            class="editor-container-canvas-content"
                            style={containerStyle.value}
                            ref={containerRef}
                            onMousedown={e => clearAllFocus(e)}
                        >
                            {
                                data.value.blocks.map((block, index) => (
                                    <EditorBlock
                                        class={[block.focus ? 'editor-block-focus' : '', previewRef.value ? 'editor-block-preview' : '']}
                                        block={block}
                                        onMousedown={e => blockMousedown(e, block, index)}
                                        // 元素右击菜单事件
                                        onContextmenu={e => blockContextmenu(e, block)}
                                        formData={props.formData}
                                        //预览模式
                                        preview = {previewRef.value}
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
                                formData={props.formData}
                            >
                            </EditorBlock>
                        ))
                    }
                </div>
                <ElButton type="primary" onClick={e => editorRef.value = true}>点击返回编辑</ElButton>
                {JSON.stringify(props.formData)}
            </div>
        )

    }
})