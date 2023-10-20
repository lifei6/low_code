import { defineComponent, computed } from "vue";
// 数据
import useCommandsStore from "@/store/commands/commands"
import useSystemStore from "@/store/system/system"
// 聚焦拖拽
import { useFocus } from "@/hooks/useFocus";
import { useBlockDragger } from "@/hooks/useBlockDragger";
// 单个组件
import EditorBlock from "./editor-block";

export default defineComponent({
    name: 'editor-container',
    props: {
        containerRef: Object,
    },
    setup(props) {
        // 1.全局响应式数据--------------更新组件列表更新整个页面
        const commandsStore = useCommandsStore()
        const systemStore = useSystemStore()

        // 2.计算画布样式-----------------容器样式
        const containerStyle = computed(() => ({
            width: commandsStore.container.width + 'px',
            height: commandsStore.container.height + 'px',
        }))

        // 3.获取焦点,选中后就可能进行拖拽
        let { blockMousedown } = useFocus(
            commandsStore,
            systemStore.preview,
            (e) => {
                mousedown(e);
            }
        );

        // 4.多个元素拖拽和辅助线
        let { mousedown, markLines } = useBlockDragger(commandsStore);

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

        return () => {
            return (
                <>
                    {/* 产生滚动条 */}
                    <div class="editor-container-canvas">
                        {/* 具体内容 */}
                        <div
                            class="editor-container-canvas-content"
                            style={containerStyle.value}
                            ref={props.containerRef}
                            // 未点击到外壳直接清除全部选中
                            onMousedown={e => commandsStore.clearAllFocus(e)}
                        >
                            {
                                commandsStore.components.map((block, index) => (
                                    <EditorBlock
                                        class={[block.focus ? 'editor-block-focus' : '', systemStore.preview ? 'editor-block-preview' : '']}
                                        block={block}
                                        // 点击拖拽或者点击聚焦
                                        onMousedown={e => blockMousedown(e, block.id, index)}
                                        // 元素右击菜单事件
                                        onContextmenu={e => blockContextmenu(e, block)}
                                        //预览模式
                                        preview={systemStore.preview}
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
                </>
            )
        }
    }
})